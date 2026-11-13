<?php
/**
 * USB Drive and Storage Mount Manager
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/config.php';

class UsbManager
{
    private static $mountPath = USB_MOUNT_PATH;

    /**
     * Check if /media/usb is currently mounted
     */
    public static function isMounted(): bool
    {
        $mountPoint = escapeshellarg(self::$mountPath);
        exec("mountpoint -q {$mountPoint}", $output, $code);
        if ($code === 0) {
            return true;
        }

        // Fallback check in /proc/mounts
        if (file_exists('/proc/mounts')) {
            $mounts = file_get_contents('/proc/mounts');
            if (strpos($mounts, self::$mountPath) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get details about the currently mounted device on /media/usb
     */
    public static function getMountedInfo(): ?array
    {
        if (!self::isMounted()) {
            return null;
        }

        $device = null;
        $fstype = null;

        if (file_exists('/proc/mounts')) {
            $lines = file('/proc/mounts', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $parts = preg_split('/\s+/', $line);
                if (isset($parts[1]) && $parts[1] === self::$mountPath) {
                    $device = $parts[0];
                    $fstype = $parts[2] ?? 'unknown';
                    break;
                }
            }
        }

        $totalBytes = @disk_total_space(self::$mountPath);
        $freeBytes  = @disk_free_space(self::$mountPath);
        $usedBytes  = ($totalBytes !== false && $freeBytes !== false) ? ($totalBytes - $freeBytes) : 0;
        $usedPercent = ($totalBytes > 0) ? round(($usedBytes / $totalBytes) * 100, 1) : 0;

        return [
            'mounted'      => true,
            'mount_path'   => self::$mountPath,
            'device'       => $device,
            'fstype'       => $fstype,
            'total_bytes'  => $totalBytes ?: 0,
            'free_bytes'   => $freeBytes ?: 0,
            'used_bytes'   => $usedBytes,
            'used_percent' => $usedPercent,
            'total_h'      => self::formatBytes($totalBytes ?: 0),
            'free_h'       => self::formatBytes($freeBytes ?: 0),
            'used_h'       => self::formatBytes($usedBytes),
        ];
    }

    /**
     * List all detectable block devices and partitions available for mounting
     */
    public static function getAvailableDevices(): array
    {
        $command = "sudo /usr/bin/lsblk -J -o NAME,SIZE,TYPE,FSTYPE,LABEL,MOUNTPOINT,UUID,MODEL,TRAN 2>/dev/null";
        $raw = shell_exec($command);
        $data = json_decode($raw, true);

        if (!isset($data['blockdevices']) || !is_array($data['blockdevices'])) {
            return [];
        }

        $devices = [];
        $isCurrentlyMounted = self::isMounted();
        $currentMountedInfo = $isCurrentlyMounted ? self::getMountedInfo() : null;
        $currentDevice = $currentMountedInfo['device'] ?? null;

        foreach ($data['blockdevices'] as $dev) {
            // Check if disk has children (partitions)
            $model = $dev['model'] ?? '';
            $tran = $dev['tran'] ?? '';

            if (isset($dev['children']) && is_array($dev['children'])) {
                foreach ($dev['children'] as $child) {
                    $devicePath = '/dev/' . $child['name'];
                    $mountpoint = $child['mountpoint'] ?? '';

                    // Exclude system boot/root partitions
                    if ($mountpoint === '/' || $mountpoint === '/boot' || strpos($mountpoint, '/boot/') === 0) {
                        continue;
                    }

                    $isMountedHere = ($currentDevice === $devicePath) || ($mountpoint === self::$mountPath);

                    $devices[] = [
                        'name'            => $child['name'],
                        'device_path'     => $devicePath,
                        'size'            => $child['size'] ?? 'N/A',
                        'fstype'          => $child['fstype'] ?? 'unknown',
                        'label'           => $child['label'] ?? '',
                        'uuid'            => $child['uuid'] ?? '',
                        'model'           => $model,
                        'transport'       => $tran,
                        'mountpoint'      => $mountpoint,
                        'is_mounted_here' => $isMountedHere,
                        'is_mounted'      => !empty($mountpoint),
                    ];
                }
            } else {
                // Disk with no partitions (e.g. formatted direct disk)
                if (($dev['type'] ?? '') === 'part' || ($dev['type'] ?? '') === 'disk') {
                    $devicePath = '/dev/' . $dev['name'];
                    $mountpoint = $dev['mountpoint'] ?? '';

                    if ($mountpoint === '/' || $mountpoint === '/boot' || strpos($mountpoint, '/boot/') === 0 || ($dev['fstype'] ?? '') === 'swap') {
                        continue;
                    }

                    $isMountedHere = ($currentDevice === $devicePath) || ($mountpoint === self::$mountPath);

                    $devices[] = [
                        'name'            => $dev['name'],
                        'device_path'     => $devicePath,
                        'size'            => $dev['size'] ?? 'N/A',
                        'fstype'          => $dev['fstype'] ?? 'unknown',
                        'label'           => $dev['label'] ?? '',
                        'uuid'            => $dev['uuid'] ?? '',
                        'model'           => $model,
                        'transport'       => $tran,
                        'mountpoint'      => $mountpoint,
                        'is_mounted_here' => $isMountedHere,
                        'is_mounted'      => !empty($mountpoint),
                    ];
                }
            }
        }

        return $devices;
    }

    /**
     * Mount a partition to /media/usb
     */
    public static function mount(string $devicePath): array
    {
        // Security check: validate device path format
        if (!preg_match('#^/dev/[a-zA-Z0-9_-]+$#', $devicePath)) {
            return ['success' => false, 'error' => 'Ruta de dispositivo inválida'];
        }

        if (!file_exists($devicePath)) {
            return ['success' => false, 'error' => 'El dispositivo no existe en el sistema'];
        }

        if (self::isMounted()) {
            return ['success' => false, 'error' => 'Ya existe una unidad montada en ' . self::$mountPath . '. Desmóntala primero.'];
        }

        // Ensure mount directory exists
        if (!is_dir(self::$mountPath)) {
            @mkdir(self::$mountPath, 0775, true);
        }

        // Detect filesystem
        $escapedDev = escapeshellarg($devicePath);
        $escapedMount = escapeshellarg(self::$mountPath);
        $fstype = trim((string)shell_exec("sudo /usr/sbin/blkid -s TYPE -o value {$escapedDev} 2>/dev/null"));

        $options = "uid=www-data,gid=www-data,umask=002";

        if ($fstype === 'ntfs') {
            // Try ntfs-3g or native ntfs
            $cmd = "sudo /usr/bin/mount -t ntfs-3g -o {$options} {$escapedDev} {$escapedMount} 2>&1";
        } elseif (in_array($fstype, ['vfat', 'fat32', 'exfat'])) {
            $cmd = "sudo /usr/bin/mount -o {$options} {$escapedDev} {$escapedMount} 2>&1";
        } else {
            // ext4 or generic
            $cmd = "sudo /usr/bin/mount {$escapedDev} {$escapedMount} 2>&1";
        }

        exec($cmd, $out, $code);

        if ($code !== 0) {
            // Retry generic mount if specific failed
            $fallbackCmd = "sudo /usr/bin/mount {$escapedDev} {$escapedMount} 2>&1";
            exec($fallbackCmd, $outFallback, $codeFallback);
            if ($codeFallback !== 0) {
                $err = implode("\n", array_merge($out, $outFallback));
                return ['success' => false, 'error' => 'Error al montar la unidad: ' . ($err ?: "Código {$code}")];
            }
        }

        if (!self::isMounted()) {
            return ['success' => false, 'error' => 'El comando finalizó pero no se confirmó el montaje en ' . self::$mountPath];
        }

        return [
            'success' => true,
            'message' => 'Dispositivo montado exitosamente en ' . self::$mountPath,
            'info'    => self::getMountedInfo()
        ];
    }

    /**
     * Unmount /media/usb
     */
    public static function unmount(): array
    {
        if (!self::isMounted()) {
            return ['success' => true, 'message' => 'La unidad ya se encuentra desmontada'];
        }

        $escapedMount = escapeshellarg(self::$mountPath);
        $cmd = "sudo /usr/bin/umount {$escapedMount} 2>&1";
        exec($cmd, $out, $code);

        if ($code !== 0) {
            // If standard umount failed because of open files, try lazy unmount or show error
            $err = implode("\n", $out);
            return ['success' => false, 'error' => 'No se pudo desmontar: ' . ($err ?: "Error desconocido ({$code})")];
        }

        return [
            'success' => true,
            'message' => 'Unidad desmontada correctamente'
        ];
    }

    private static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

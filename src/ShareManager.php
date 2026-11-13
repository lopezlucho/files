<?php
/**
 * Shared Links Manager
 * Compatible with PHP 7.4+
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once __DIR__ . '/FileManager.php';

class ShareManager
{
    /**
     * Create a public share for a file or folder
     */
    public static function createShare(string $source, string $relativePath, ?string $password = null, ?int $expiresInHours = null): array
    {
        $fullPath = FileManager::resolvePath($source, $relativePath);
        if (!file_exists($fullPath)) {
            throw new Exception('El elemento que intentas compartir no existe.');
        }

        $isFolder = is_dir($fullPath) ? 1 : 0;
        $filename = basename($fullPath);
        $token = bin2hex(random_bytes(24)); // 48 chars hex string

        $passwordHash = null;
        if (!empty($password)) {
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        }

        $expiresAt = null;
        if (!empty($expiresInHours) && $expiresInHours > 0) {
            $expiresAt = date('Y-m-d H:i:s', strtotime("+{$expiresInHours} hours"));
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('
            INSERT INTO shares (token, source, path, filename, is_folder, password, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $token,
            $source,
            $relativePath,
            $filename,
            $isFolder,
            $passwordHash,
            $expiresAt
        ]);

        return [
            'success'   => true,
            'token'     => $token,
            'share_url' => BASE_URL . '/share.php?t=' . $token,
            'expires_at'=> $expiresAt,
            'has_pass'  => !empty($passwordHash),
        ];
    }

    /**
     * Retrieve share by token and validate expiration
     */
    public static function getShare(string $token): ?array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT * FROM shares WHERE token = ? LIMIT 1');
        $stmt->execute([$token]);
        $share = $stmt->fetch();

        if (!$share) {
            return null;
        }

        // Check expiration
        if (!empty($share['expires_at'])) {
            if (strtotime($share['expires_at']) < time()) {
                return ['expired' => true, 'id' => $share['id'], 'token' => $token];
            }
        }

        $share['has_password'] = !empty($share['password']);
        $share['expired'] = false;
        return $share;
    }

    /**
     * Validate user password against protected share
     */
    public static function verifyPassword(array $share, string $password): bool
    {
        if (empty($share['password'])) {
            return true;
        }
        return password_verify($password, $share['password']);
    }

    /**
     * Increment download counter
     */
    public static function incrementDownloads(int $shareId): void
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('UPDATE shares SET downloads = downloads + 1 WHERE id = ?');
        $stmt->execute([$shareId]);
    }

    /**
     * List all shares for administration
     */
    public static function listShares(): array
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query('SELECT * FROM shares ORDER BY created_at DESC');
        $shares = $stmt->fetchAll();

        foreach ($shares as &$s) {
            $s['has_password'] = !empty($s['password']);
            $s['is_expired']   = !empty($s['expires_at']) && strtotime($s['expires_at']) < time();
            $s['share_url']    = BASE_URL . '/share.php?t=' . $s['token'];
            $s['created_h']    = date('d/m/Y H:i', strtotime($s['created_at']));
            $s['expires_h']    = !empty($s['expires_at']) ? date('d/m/Y H:i', strtotime($s['expires_at'])) : 'Sin expiración';
        }

        return $shares;
    }

    /**
     * Revoke / delete share
     */
    public static function deleteShare(string $token): bool
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('DELETE FROM shares WHERE token = ?');
        return $stmt->execute([$token]);
    }
}

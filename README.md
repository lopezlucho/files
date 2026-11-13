# Cloud Files - Gestor de Archivos en la Nube con Soporte USB

Gestor de archivos web desarrollado en **PHP 7.4+** nativo (Vanilla PHP, sin frameworks), con interfaz moderna basada en **AdminLTE 3**, **Bootstrap 4**, **DataTables**, **SweetAlert2** y **Dropzone**.

Diseñado para uso personal o empresarial con gestión de almacenamiento local y capacidad de **montar y desmontar unidades USB externas** directamente desde el navegador.

---

## 🚀 Características Principales

- **Gestión de Archivos Completa:**
  - Subida múltiple y concurrente mediante arrastrar y soltar (*drag & drop*) con barra de progreso.
  - Navegación fluida por carpetas con migas de pan (*breadcrumbs*).
  - Previsualización modal integrada para:
    - 🖼️ Imágenes (`jpg`, `png`, `gif`, `webp`, `svg`).
    - 📄 Documentos PDF interactivos.
    - 🎬 Videos (`mp4`, `webm`).
    - 🎵 Audios (`mp3`, `wav`, `ogg`).
    - 📝 Archivos de texto y código fuente (`txt`, `json`, `js`, `css`, `html`, `php`, `sql`, `py`, `sh`, etc.).
  - Descarga directa individual y descarga de carpetas completas en formato `.ZIP`.
  - Creación de carpetas, renombrado y eliminación con confirmaciones interactivas (*SweetAlert2*).
  - Medidor visual del espacio de disco utilizado y disponible en tiempo real.

- **🔌 Soporte de Unidades USB Externas:**
  - Detección automática de discos y particiones USB (`lsblk` / `blkid`).
  - Montaje y desmontaje seguro en el punto de montaje estándar `/media/usb` vía web.
  - Soporte para sistemas de archivos **NTFS**, **FAT32**, **exFAT** y **ext4**.
  - Conservación de los nombres reales y estructura de archivos en la unidad física para su portabilidad.

- **🔗 Enlaces Compartidos Públicos:**
  - Generación de enlaces únicos para compartir archivos o carpetas con terceros.
  - Protección opcional mediante contraseña.
  - Control de caducidad temporal configurable (1 hora, 1 día, 1 semana, 1 mes, o permanente).
  - Contador de descargas y panel de administración para revocar enlaces en cualquier momento.

- **🛡️ Seguridad y Rendimiento:**
  - Autenticación con contraseñas cifradas vía `password_hash` (Bcrypt).
  - Protección contra ataques de *Path Traversal* (`..`) y sanitización estricta de nombres.
  - Consultas preparadas vía PDO contra inyección SQL.
  - Protección de carpetas críticas del sistema (`config/`, `src/`, `storage/`, `views/`) mediante directivas `.htaccess`.
  - Recursos estáticos (*CSS*, *JS*, fuentes) empaquetados en local para funcionamiento 100% offline en redes locales (LAN).

---

## 📁 Estructura del Proyecto

```text
files/
├── .htaccess                 # Enrutamiento de URLs limpias
├── .gitignore                # Reglas de exclusión de Git
├── README.md                 # Documentación del proyecto
├── index.php                 # Enrutador principal y controlador de vistas
├── share.php                 # Portal público de descarga y vista de compartidos
├── config/
│   ├── .htaccess             # Protección de acceso HTTP
│   ├── config.php            # Parámetros de conexión y constantes del sistema
│   ├── database.php          # Singleton de conexión PDO
│   └── database.sql          # Esquema de base de datos e inserciones iniciales
├── src/
│   ├── .htaccess             # Protección de acceso HTTP
│   ├── Auth.php              # Control de sesiones, login, logout y cambio de clave
│   ├── FileManager.php       # Operaciones con el sistema de archivos (local y USB)
│   ├── UsbManager.php        # Escaneo, montaje y desmontaje de discos externos
│   └── ShareManager.php      # Lógica de enlaces compartidos
├── api/
│   ├── auth.php              # Endpoints AJAX de autenticación
│   ├── files.php             # Endpoints AJAX para listar, subir, previsualizar, etc.
│   ├── usb.php               # Endpoints AJAX para montar y listar dispositivos
│   └── share.php             # Endpoints AJAX para crear y revocar enlaces
├── views/
│   ├── .htaccess             # Protección de acceso HTTP
│   ├── auth/login.php        # Pantalla de inicio de sesión
│   ├── files/index.php       # Explorador de archivos (DataTables)
│   ├── usb/index.php         # Panel de gestión de dispositivos USB
│   ├── shares/index.php      # Panel de administración de enlaces compartidos
│   └── layout/               # Plantillas maestras (Header, Navbar, Sidebar, Footer)
├── storage/                  # Directorio local de almacenamiento de archivos
└── public/
    ├── css/custom.css        # Estilos personalizados
    ├── js/app.js             # Lógica cliente (DataTables, Dropzone, SweetAlert2)
    └── assets/               # Librerías locales (AdminLTE, Bootstrap, FontAwesome, etc.)
```

---

## ⚙️ Configuración y Credenciales

- **Base de Datos:** MariaDB / MySQL (`files_db`).
- **Punto de Montaje USB:** `/media/usb`.
- **Credenciales iniciales:**
  - **Usuario:** `admin`
  - **Contraseña inicial:** `arcadia`
  *(Puedes cambiar tu contraseña en cualquier momento desde el menú superior derecho).*

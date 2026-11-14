# Cloud Files - Gestor de Archivos en la Nube con Modo Commander (Dual Panel)

Gestor de archivos web avanzado desarrollado en **PHP 7.4+** nativo (Vanilla PHP, sin frameworks), con interfaz moderna inspirada en **Midnight Commander**, **Norton Commander** y **Total Commander**, utilizando **AdminLTE 3**, **Bootstrap 4**, **SweetAlert2** y **Dropzone**.

Diseñado para máxima productividad mediante **dos paneles paralelos independientes** y control **100% mediante teclado**.

---

## ⚡ Novedades: Modo Commander (Dual Panel)

- **Dos paneles independientes (Izquierdo / Derecho):**
  - Cada panel puede navegar en el **almacenamiento local** o en la **unidad USB** de forma independiente.
  - Permite copiar o mover archivos y carpetas directamente de Local a USB, de USB a Local, o entre diferentes directorios de una misma unidad.
  - Indicador visual de panel **[ACTIVO]** y panel destino.
- **Navegación completa por teclado (MC Style):**
  - <kbd>Tab</kbd>: Alternar foco entre el panel izquierdo y el panel derecho.
  - <kbd>↑</kbd> / <kbd>↓</kbd>: Desplazamiento del cursor entre archivos.
  - <kbd>Espacio</kbd> o <kbd>Insert</kbd>: **Seleccionar / Deseleccionar** el elemento enfocado y **saltar automáticamente al siguiente** (estilo Midnight Commander).
  - <kbd>Enter</kbd>: Entrar a carpeta o abrir previsualización del archivo.
  - <kbd>Backspace</kbd>: Subir al directorio padre (`..`).
  - <kbd>*</kbd> o <kbd>Ctrl+A</kbd>: Invertir selección o seleccionar todo.
- **Teclas de función F1 a F9 & Barra inferior clásica:**
  - <kbd>F1</kbd>: **Ayuda** — Abre el modal con todos los atajos de teclado.
  - <kbd>F3</kbd>: **Ver** — Previsualización interactiva de imágenes, PDF, video, audio y texto.
  - <kbd>F4</kbd>: **Editar** — Editor de texto y código fuente en pantalla con guardado rápido mediante <kbd>Ctrl+S</kbd> o <kbd>F2</kbd>.
  - <kbd>F5</kbd>: **Copiar** — Copia masiva de los elementos seleccionados hacia la carpeta actual del panel opuesto.
  - <kbd>F6</kbd>: **Mover** — Traslado masivo de los elementos seleccionados hacia la carpeta actual del panel opuesto.
  - <kbd>F7</kbd>: **Nueva Carpeta** — Crea un nuevo directorio en el panel activo.
  - <kbd>F8</kbd> / <kbd>Supr</kbd>: **Borrar** — Eliminación masiva con confirmación interactiva.
  - <kbd>F9</kbd>: **Origen** — Alterna rápidamente el origen del panel activo entre **Local** y **USB**.

---

## 🚀 Características Principales

- **Gestión Masiva de Archivos:**
  - Copia y movimiento masivo recursivo de archivos y directorios completos.
  - Soporte de subida múltiple mediante arrastrar y soltar (*Dropzone*) a la carpeta actual del panel activo.
  - Descarga individual o de carpetas completas en `.ZIP`.
- **🔌 Soporte de Unidades USB Externas:**
  - Detección automática de discos y particiones USB (`lsblk` / `blkid`).
  - Montaje y desmontaje seguro en `/media/usb` vía web con soporte para NTFS, FAT32, exFAT y ext4.
  - Conservación de los nombres reales y estructura de archivos en la unidad física.
- **🔗 Enlaces Compartidos Públicos:**
  - Enlaces públicos con token único, protección por contraseña y expiración temporal.
  - Portal de descarga y visualización pública con contador de accesos.
- **🛡️ Seguridad y Rendimiento:**
  - Autenticación con contraseñas encriptadas mediante Bcrypt.
  - Prevención de *Path Traversal* y sanitización estricta.
  - Carpetas críticas del sistema protegidas con `.htaccess`.
  - Recursos estáticos locales para funcionamiento 100% offline.

---

## 📁 Estructura del Proyecto

```text
files/
├── .htaccess                 # Reglas de enrutamiento web
├── .gitignore                # Exclusiones de Git
├── README.md                 # Documentación
├── index.php                 # Enrutador principal
├── share.php                 # Portal de enlaces compartidos públicos
├── config/
│   ├── config.php            # Configuración general y constantes
│   ├── database.php          # Singleton PDO MariaDB
│   └── database.sql          # Migración de base de datos
├── src/
│   ├── Auth.php              # Autenticación y sesiones
│   ├── FileManager.php       # Operaciones de disco y copias masivas
│   ├── UsbManager.php        # Escaneo, montaje y desmontaje USB
│   └── ShareManager.php      # Gestión de enlaces públicos
├── api/
│   ├── auth.php              # API de login y usuarios
│   ├── files.php             # API de archivos, edición y copias masivas
│   ├── usb.php               # API de control USB
│   └── share.php             # API de enlaces compartidos
├── views/
│   ├── auth/login.php        # Pantalla de acceso
│   ├── files/index.php       # Explorador Dual Commander
│   ├── usb/index.php         # Gestión de discos USB
│   ├── shares/index.php      # Administración de compartidos
│   └── layout/               # Header, Navbar, Sidebar, Footer con Editor F4 y Modales
├── storage/                  # Carpeta de almacenamiento local
└── public/
    ├── css/custom.css        # Estilos Commander (foco, selecciones, barra F-keys)
    ├── js/app.js             # Lógica cliente (Dual panels, atajos de teclado, F1-F9)
    └── assets/               # Librerías locales (AdminLTE, Bootstrap, FontAwesome, etc.)
```

---

## 🔑 Credenciales de Acceso

- **URL:** `http://localhost/files/`
- **Usuario:** `admin`
- **Contraseña:** `admin`
*(Puedes cambiar tu contraseña en cualquier momento desde el menú superior derecho).*

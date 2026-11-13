<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Iniciar Sesión - <?= htmlspecialchars(APP_NAME) ?></title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/css/custom.css">
</head>
<body class="hold-transition login-page bg-light">
<div class="login-box">
    <div class="card card-outline card-primary shadow">
        <div class="card-header text-center py-3">
            <span class="h1"><i class="fas fa-cloud text-primary mr-1"></i><b><?= htmlspecialchars(APP_NAME) ?></b></span>
            <p class="text-muted small mb-0 mt-1">Gestor de Archivos en la Nube</p>
        </div>
        <div class="card-body">
            <p class="login-box-msg">Ingresa tus credenciales para acceder</p>
            <form id="loginForm">
                <div class="input-group mb-3">
                    <input type="text" name="username" class="form-control" placeholder="Usuario" required autofocus autocomplete="username">
                    <div class="input-group-append">
                        <div class="input-group-text"><span class="fas fa-user"></span></div>
                    </div>
                </div>
                <div class="input-group mb-3">
                    <input type="password" name="password" class="form-control" placeholder="Contraseña" required autocomplete="current-password">
                    <div class="input-group-append">
                        <div class="input-group-text"><span class="fas fa-lock"></span></div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary btn-block font-weight-bold" id="btnLogin">
                            <i class="fas fa-sign-in-alt mr-1"></i> Iniciar Sesión
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <div class="card-footer text-center text-muted small py-2">
            Uso Personal &bull; Conexión Segura
        </div>
    </div>
</div>

<script src="<?= BASE_URL ?>/public/assets/plugins/jquery/jquery.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="<?= BASE_URL ?>/public/assets/plugins/sweetalert2/sweetalert2.min.js"></script>
<script>
$(document).ready(function() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        var $btn = $('#btnLogin');
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i> Accediendo...');

        $.ajax({
            url: '<?= BASE_URL ?>/api/auth.php?action=login',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(res) {
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Acceso concedido',
                        timer: 1000,
                        showConfirmButton: false
                    }).then(function() {
                        window.location.href = '<?= BASE_URL ?>/';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de acceso',
                        text: res.error || 'Credenciales incorrectas'
                    });
                    $btn.prop('disabled', false).html('<i class="fas fa-sign-in-alt mr-1"></i> Iniciar Sesión');
                }
            },
            error: function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al conectar con el servidor'
                });
                $btn.prop('disabled', false).html('<i class="fas fa-sign-in-alt mr-1"></i> Iniciar Sesión');
            }
        });
    });
});
</script>
</body>
</html>

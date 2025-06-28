<?php
/**
 * Logout - Survey Platform Indonesia
 * PHP Version for Web Hosting
 */

require_once 'config/database.php';
require_once 'includes/auth.php';

$auth = new Auth();
$auth->logout();

header('Location: index.php?message=logged_out');
exit;
?>
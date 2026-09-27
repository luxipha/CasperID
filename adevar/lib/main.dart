import 'package:flutter/material.dart';
import 'config/app_theme.dart';
import 'screens/splash/splash_page.dart';
import 'screens/auth/auth_page.dart';
import 'screens/home/home_page.dart';
import 'screens/id_card/id_card_page.dart';
import 'screens/qr_scanner/qr_scanner_page.dart';
import 'screens/zk_liveness/zk_liveness_page.dart';
import 'screens/pairing/pairing_page.dart';
import 'screens/data_warehouse/data_warehouse_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CasperIDApp());
}

class CasperIDApp extends StatelessWidget {
  const CasperIDApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CasperID',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashPage(),
        '/auth': (context) => const AuthPage(),
        '/home': (context) => const HomePage(),
        '/id-card': (context) => const IdCardPage(),
        '/qr-scanner': (context) => const QrScannerPage(),
        '/zk-liveness': (context) => const LivenessPage(),
        '/pairing': (context) => const PairingPage(),
        '/data-warehouse': (context) => const DataWarehousePage(),
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class LoadingScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Loading Screen'),
      ),
      body: Column(
        children: [
          // Center(
          //   child:
          //   Lottie.asset('assets/animations/loading.json'),
          // ),
        ],
      ),
    );
  }
}

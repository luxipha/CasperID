import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class LoadingIdeaCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: size.height * 0.01),
      child: Container(
        padding: EdgeInsets.only(left: size.width * 0.05),
        height: size.height * 0.125,
        width: size.width,
        decoration: BoxDecoration(
            color: const Color(0xffF2F2F7),
            borderRadius: BorderRadius.circular(size.height * 0.025)),
        child: Lottie.asset('assets/animations/loading.json', height: 200),
      ),
    );
  }
}

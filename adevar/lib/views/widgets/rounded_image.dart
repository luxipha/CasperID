import 'package:flutter/material.dart';

class RoundedImage extends StatelessWidget {
  final String image;
  final Color color;
  final double height;
  final double leftPadding;

  final double rightPadding;

  final double topPadding;

  final double bottomPadding;

  final double width;
  final bool isCenterCrop;

  RoundedImage({
    required this.image,
    this.color = const Color(0xffCE4C3C),
    this.height = 30,
    this.width = 30,
    this.isCenterCrop=false,
    this.leftPadding = 8,
    this.rightPadding = 8,
    this.topPadding = 8,
    this.bottomPadding = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Image(
        image: AssetImage(image),
        height: height,
        width: width,
        fit: isCenterCrop ? BoxFit.cover : BoxFit.none,
      ),
      padding: EdgeInsets.fromLTRB(
          leftPadding, topPadding, rightPadding, bottomPadding),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(
          50,
        ),
      ),
    );
  }
}

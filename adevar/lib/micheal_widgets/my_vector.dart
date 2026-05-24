import 'dart:ui' as ui;

import 'dart:ui';

import 'package:flutter/material.dart';

//Add this CustomPaint widget to the Widget Tree
// CustomPaint(
// size: Size(WIDTH, (WIDTH*0.64).toDouble()), //You can Replace [WIDTH] with your desired width for Custom Paint and height will be calculated automatically
// painter: RPSCustomPainter(),
// )

//Copy this CustomPainter code to the Bottom of the File
class RPSCustomPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    Path path_0 = Path();
    path_0.moveTo(size.width * 0.1645570, 0);
    path_0.cubicTo(
        size.width * 0.1776544,
        size.height * 0.3433456,
        size.width * 0.1435722,
        size.height * 0.7318926,
        0,
        size.height * 0.9926471);
    path_0.lineTo(size.width, size.height * 0.9926471);
    path_0.cubicTo(
        size.width * 0.7696696,
        size.height * 0.7524618,
        size.width * 0.7211241,
        size.height * 0.3655191,
        size.width * 0.7405063,
        0);
    path_0.lineTo(size.width * 0.1645570, 0);
    path_0.close();

    Paint paint_0_fill = Paint()..style = PaintingStyle.fill;
    paint_0_fill.color = Color(0xff4ACE7F).withOpacity(0.5);
    canvas.drawPath(path_0, paint_0_fill);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}

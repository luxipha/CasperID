import 'dart:math';

import 'package:flutter/material.dart';

// ignore: must_be_immutable
class MyCustomWaveWidget extends StatefulWidget {
  final double height;
  final double width;
  final Color borderColor, foregroundWaveColor;
  Color? backgroundWaveColor;
  final double progress;
  final double borderSize;
  final double innerPadding;

  MyCustomWaveWidget({
    this.borderSize = 10,
    required this.height,
    required this.width,
    required this.borderColor,
    required this.foregroundWaveColor,
    this.backgroundWaveColor,
    required this.progress,
    this.innerPadding = 0,
  }) {
    if (backgroundWaveColor == null) {
      backgroundWaveColor = foregroundWaveColor.withOpacity(0.5);
    }
  }

  @override
  MyCustomWaveWidgetState createState() => MyCustomWaveWidgetState();
}

class MyCustomWaveWidgetState extends State<MyCustomWaveWidget>
    with TickerProviderStateMixin {
  AnimationController? controller;

  double getWaterHeight() {
    if (widget.progress < 10) {
      return widget.progress;
    } else if (widget.progress == widget.height) {
      return widget.height;
    } else if (widget.progress > 10) {
      return widget.progress - 10;
    } else {
      return widget.progress;
    }
  }

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 2500),
    );

    controller?.repeat();
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      child: Stack(
        children: [
          Container(
            // decoration: ShapeDecoration(
            //   shape: CircleBorder(
            //     side: BorderSide(
            //       color: widget.borderColor,
            //       width: widget.borderSize,
            //     ),
            //   ),
            // ),
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              // color: Colors.purple,
              borderRadius: BorderRadius.circular(16),
            ),
            // padding: EdgeInsets.all(widget.innerPadding),
            child: AnimatedBuilder(
              animation: controller!,
              builder: (BuildContext context, Widget? child) {
                return CustomPaint(
                  painter: WaveProgressPainter(
                    controller,
                    widget.backgroundWaveColor!,
                    widget.foregroundWaveColor,
                    widget.progress,
                    widget.height,
                  ),
                );
              },
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: widget.width,
              height:
                  widget.progress < 10 ? widget.progress : widget.progress - 10,
              // color: Colors.green,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    widget.foregroundWaveColor,
                    Colors.white,
                  ],
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: widget.width,
              height:
                  widget.progress < 10 ? widget.progress : widget.progress - 10,
              // color: Colors.green,
              decoration: BoxDecoration(
                color: widget.foregroundWaveColor,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class WaveProgressPainter extends CustomPainter {
  Animation<double>? _animation;
  Color backgroundWaveColor, foregroundWaveColor;
  double _progress;
  double maxHeight;

  WaveProgressPainter(
    this._animation,
    this.backgroundWaveColor,
    this.foregroundWaveColor,
    this._progress,
    this.maxHeight,
  ) : super(repaint: _animation);

  @override
  void paint(Canvas canvas, Size size) {
    // draw small wave
    Paint wave2Paint = Paint()..color = backgroundWaveColor;
    double p = _progress / maxHeight;
    double n = 4.3;
    double amp = 1.0;
    double baseHeight = (1 - p) * size.height;

    Path path = Path();
    path.moveTo(0.0, baseHeight);
    for (double i = 0.0; i < size.width; i++) {
      path.lineTo(
          i,
          baseHeight +
              sin((i / size.width * 2 * pi * n) +
                      (_animation!.value * 2 * pi) +
                      pi * 1) *
                  amp);
    }

    path.lineTo(size.width, size.height);
    path.lineTo(0.0, size.height);
    path.close();
    canvas.drawPath(path, wave2Paint);

    // draw big wave
    Paint wave1Paint = Paint()..color = foregroundWaveColor;
    n = 2.2;
    amp = 10.0 * size.height / 180;

    path = Path();
    path.moveTo(0.0, baseHeight);
    for (double i = 0.0; i < size.width; i++) {
      path.lineTo(
          i,
          baseHeight +
              sin((i / size.width * 2 * pi * n) +
                      (_animation!.value * 2 * pi)) *
                  amp);
    }

    path.lineTo(size.width, size.height);
    path.lineTo(0.0, size.height);
    path.close();
    canvas.drawPath(path, wave1Paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class CircleClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    return Path()
      ..addOval(Rect.fromCircle(
          center: Offset(size.width / 2, size.height / 2),
          radius: size.width / 2));
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) {
    return true;
  }
}

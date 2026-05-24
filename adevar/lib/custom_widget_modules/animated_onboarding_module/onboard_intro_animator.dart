import 'package:flutter/material.dart';

class OnBoardIntroAnimator {
  late TickerProvider _vsync;
  late AnimationController _controller;
  late Animation _animation;

  //  static final OverBoardAnimator _singleton = new OverBoardAnimator._internal();

  // factory OverBoardAnimator(_vsync) {
  //   _singleton._vsync = _vsync;
  //   _singleton._controller = AnimationController(
  //       vsync: _vsync, duration: const Duration(milliseconds: 500));
  //   _singleton._animation = CurvedAnimation(parent: _singleton._controller, curve: Curves.easeIn);
  //   return _singleton;
  // }

  // OverBoardAnimator._internal();

  OnBoardIntroAnimator(vsync) {
    this._vsync = vsync;
    _controller = AnimationController(
        vsync: _vsync, duration: const Duration(milliseconds: 400));
    //_animation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    /*_animation =Tween(begin: 0.0, end: 1.0)
        .animate(CurvedAnimation(curve: Curves.easeOut, parent: _controller!));*/

    print('creating new animator');
  }

  AnimationController getController() {
    return _controller;
  }

  Animation getAnimator() {
    return _animation;
  }

  dispose() {
    _controller.dispose();
  }
}
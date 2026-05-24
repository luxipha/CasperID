import 'dart:math';

import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/change_tutorial_image/change_tutorial_image.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';
import 'package:rive/rive.dart';

import 'onboard_circular_clipper.dart';
import 'onboard_intro_animator.dart';
import 'onboard_page_model.dart';

enum IntroSwipeDirection { LEFT_TO_RIGHT, RIGHT_TO_LEFT, SKIP_TO_LAST }

class OnBoardIntroWidget extends StatefulWidget {
  final List<OnBoardPageModel> pages;
  final Offset? center;
  final bool showBullets;
  final bool showSkipButton;

  final VoidCallback finishCallback;
  final VoidCallback? skipCallback;
  final String? skipText, nextText, finishText;
  final Color buttonColor;

  OnBoardIntroWidget(
      {Key? key,
      required this.pages,
      this.center,
      this.showBullets = true,
      this.showSkipButton = false,
      this.skipText,
      this.nextText,
      this.finishText,
      required this.finishCallback,
      this.skipCallback,
      this.buttonColor = Colors.white})
      : super(key: key);

  @override
  _OnBoardIntroWidgetState createState() => _OnBoardIntroWidgetState();
}

class _OnBoardIntroWidgetState extends State<OnBoardIntroWidget>
    with TickerProviderStateMixin {
  late OnBoardIntroAnimator _animator;
  final ChangeTutorialImageController _changeTutorialImageController =
      Get.isRegistered<ChangeTutorialImageController>()
          ? Get.find<ChangeTutorialImageController>()
          : Get.put(ChangeTutorialImageController());
  ScrollController _scrollController = new ScrollController();
  double _bulletPadding = 5.0, _bulletSize = 10.0, _bulletContainerWidth = 0;

  int _counter = 0, _last = 0;
  int _total = 0;
  double initial = 0, distance = 0;
  Random random = new Random();
  IntroSwipeDirection _swipeDirection = IntroSwipeDirection.RIGHT_TO_LEFT;

  @override
  void initState() {
    super.initState();

    _animator = new OnBoardIntroAnimator(this);
    _total = widget.pages.length;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: _getStack(),
    );
  }

  _getStack() {
    return GestureDetector(
      onPanStart: (DragStartDetails details) {
        initial = details.globalPosition.dx;
      },
      onPanUpdate: (DragUpdateDetails details) {
        distance = details.globalPosition.dx - initial;
      },
      onPanEnd: (DragEndDetails details) {
        initial = 0.0;
        setState(() {
          _last = _counter;
        });
        if (distance > 1 && _counter > 0) {
          setState(() {
            _counter--;
            _swipeDirection = IntroSwipeDirection.LEFT_TO_RIGHT;
          });
          _animate();
        } else if (distance < 0 && _counter < _total - 1) {
          setState(() {
            _counter++;
            _swipeDirection = IntroSwipeDirection.RIGHT_TO_LEFT;
          });
          _animate();
        }
      },
      child: Stack(
        children: <Widget>[
          _getPage(_last),
          AnimatedBuilder(
            animation: _animator.getAnimator(),
            builder: (context, child) {
              return ClipOval(
                clipper: OnBoardCircularClipper(
                    _animator.getAnimator().value, widget.center),
                child: _getPage(_counter),
              );
            },
            child: Container(),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 30,
            child: (_counter < _total - 1
                    ? _getCircularNextButton(
                        _next,
                        _counter == 0
                            ? AppColors.ON_BOARD_BUTTON_ONE
                            : AppColors.ON_BOARD_BUTTON_TWO,
                        false) /*_getTextButton(
              (widget.nextText ?? "NEXT"),
              _next,
            )*/
                    : Center(
                        child: /*_getStartedButton(widget.finishCallback)*/ _getCircularNextButton(
                            widget.finishCallback,
                            AppColors.ON_BOARD_BUTTON_THREE,
                            true),
                      ) /*_getTextButton((widget.finishText ?? "FINISH"),
                widget.finishCallback)*/
                ),
          ),

          /*Positioned(
            left: 0,
            right: 0,
            bottom: 30,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                widget.showSkipButton
                    ? Opacity(
                        child: _getTextButton(
                            widget.skipText ?? "SKIP",
                            (widget.skipCallback != null
                                ? widget.skipCallback
                                : _skip)),
                        opacity: (_counter < _total - 1) ? 1.0 : 0.0,
                      )
                    : Container(),
                Expanded(
                  child: Center(child: LayoutBuilder(
                    builder: (context, constraints) {
                      _bulletContainerWidth = constraints.maxWidth - 40.0;
                      return Container(
                        padding: const EdgeInsets.all(20.0),
                        child: (widget.showBullets
                            ? SingleChildScrollView(
                                physics: NeverScrollableScrollPhysics(),
                                scrollDirection: Axis.horizontal,
                                controller: _scrollController,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: <Widget>[
                                    for (int i = 0; i < _total; i++)
                                      Padding(
                                        padding: EdgeInsets.all(_bulletPadding),
                                        child: Container(
                                          height: _bulletSize,
                                          width: _bulletSize,
                                          decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: (i == _counter
                                                  ? Colors.white
                                                  : Colors.white30)),
                                        ),
                                      )
                                  ],
                                ),
                              )
                            : Container()),
                      );
                    },
                  )),
                ),
                (_counter < _total - 1
                    ? _getCircularNextButton(
                        _next,
                        _counter == 0
                            ? AppColors.ON_BOARD_BUTTON_ONE
                            : AppColors
                                .ON_BOARD_BUTTON_TWO) */ /*_getTextButton(
                  (widget.nextText ?? "NEXT"),
                  _next,
                )*/ /*
                    : _getStartedButton(widget
                        .finishCallback) */ /*_getTextButton((widget.finishText ?? "FINISH"),
                    widget.finishCallback)*/ /*
                ),
              ],
            ),
          ),*/
        ],
      ),
    );
  }

  _getPage(index) {
    OnBoardPageModel page = widget.pages[index];

    return Container(
      width: double.infinity,
      height: double.infinity,
      color: page.color,
      child: page.child != null
          ? Center(
              child: page.doAnimateChild
                  ? AnimatedOnBoardIntro(
                      animator: _animator,
                      child: page.child,
                    )
                  : page.child,
            )
          : Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                page.doAnimateImage
                    ? /* AnimatedOnBoardIntro(
                        animator: _animator,*/
                    /*child:*/ new Padding(
                        padding: new EdgeInsets.only(bottom: 25.0),
                        child: Container(
                          key: page.keys,
                          width: 300.0,
                          height: 300.0,
                          child: RiveAnimation.asset(page.imageAssetPath!),
                        ) /*Image.asset(page.imageAssetPath!,
                                  width: 300.0, height: 300.0),*/
                        )

                    /*)*/
                    : Padding(
                        padding: new EdgeInsets.only(bottom: 25.0),
                        child: Container(
                            width: 300,
                            height: 300,
                            child: RiveAnimation.asset(page.imageAssetPath!)),
                      ),
                /*Image.asset(page.imageAssetPath!,
                        width: 300.0, height: 300.0),*/
                Center(child: LayoutBuilder(
                  builder: (context, constraints) {
                    _bulletContainerWidth = constraints.maxWidth - 40.0;
                    return Container(
                      padding: const EdgeInsets.all(20.0),
                      child: (widget.showBullets
                          ? SingleChildScrollView(
                              physics: NeverScrollableScrollPhysics(),
                              scrollDirection: Axis.horizontal,
                              controller: _scrollController,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: <Widget>[
                                  for (int i = 0; i < _total; i++)
                                    Container(
                                      width: i == _counter ? 24.0 : 12.0,
                                      height: i == _counter ? 6.0 : 12.0,
                                      margin: EdgeInsets.symmetric(
                                          horizontal: 10.0),
                                      decoration: BoxDecoration(
                                          shape: BoxShape.rectangle,
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          color: (i == _counter
                                              ? AppColors.BUTTON_COLOR
                                              : AppColors.FORM_GREY)),
                                    )
                                  /* Padding(
                                padding: EdgeInsets.all(_bulletPadding),
                                child: Container(
                                  height: _bulletSize,
                                  width: _bulletSize,
                                  decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: (i == _counter
                                          ? Colors.white
                                          : Colors.white30)),
                                ),
                              )*/
                                ],
                              ),
                            )
                          : Container()),
                    );
                  },
                )),
                page.titleWidget!,
                /* Padding(
                  padding: new EdgeInsets.only(
                      top: 10.0, bottom: 10.0, left: 30.0, right: 30.0),
                  child: new Text(
                    page.title!,
                    textAlign: TextAlign.center,
                    style: new TextStyle(
                      color: Colors.white,
                      fontSize: 34.0,
                    ),
                  ),
                ),*/
                SizedBox(
                  height: 10,
                ),
                Padding(
                  padding: new EdgeInsets.only(
                      bottom: 75.0, left: 16.0, right: 16.0),
                  child: new Text(
                    page.body!,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(
                        color: page.bodyColor,
                        fontSize: 16,
                        fontWeight: FontWeight.w400),
                  ),
                ),
              ],
            ),
    );
  }

  _getCircularNextButton(_onPress, _color, bool isGetStarted) {
    return InkWell(
      onTap: isGetStarted
          ? () {
              Get.to(() => RegisterPhoneNumberPage());
            }
          : _onPress,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 400),
        height: 52,
        width: isGetStarted ? 154 : 52,
        decoration: isGetStarted
            ? BoxDecoration(
                borderRadius: BorderRadius.circular(61), color: _color)
            : BoxDecoration(
                shape: BoxShape.circle,
                color: _color,
              ),
        child: isGetStarted
            ? Center(
                child: Text(
                  'Get Started',
                  style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500),
                ),
              )
            : Icon(
                Icons.arrow_forward_outlined,
                color: Colors.white,
                size: 22,
              ),
      ),
    );
  }

  _getStartedButton(/*_text,*/ _onPress) {
    return InkWell(
      onTap: () {
        Get.to(() => RegisterPhoneNumberPage());
        /*_onPress*/
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: 400),
        height: 52,
        width: 154,
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(61),
            color: AppColors.ON_BOARD_BUTTON_THREE),
        child: Center(
          child: Text(
            'Get Started',
            style: GoogleFonts.roboto(
                color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
          ),
        ),
      ),
    );
  }

  _getTextButton(_text, _onPress) {
    return TextButton(
      style: TextButton.styleFrom(
        padding: const EdgeInsets.all(20.0),
      ),
      child: Text(
        _text,
        style: TextStyle(color: widget.buttonColor),
      ),
      onPressed: _onPress,
    );
  }

  _next() {
    setState(() {
      _swipeDirection = IntroSwipeDirection.RIGHT_TO_LEFT;
      _last = _counter;
      _counter++;
    });
    //  _changeTutorialImageController.changeIndex(_counter);
    _animate();
  }

  _skip() {
    setState(() {
      _swipeDirection = IntroSwipeDirection.SKIP_TO_LAST;
      _last = _counter;
      _counter = _total - 1;
    });
    _animate();
  }

  _animate() {
    _animator.getController().forward(from: 1.0);

    double _bulletDimension = (_bulletPadding * 2) + (_bulletSize);
    double _scroll = _bulletDimension * _counter;
    double _maxScroll = _bulletDimension * _total - 1;
    if (_scroll > _bulletContainerWidth &&
        _swipeDirection == IntroSwipeDirection.RIGHT_TO_LEFT) {
      /*double _scrollDistance =
          (((_scroll - _bulletContainerWidth) ~/ _bulletDimension) + 1) *
              _bulletDimension;*/
    /*  _scrollController.animateTo(_scrollDistance,
          curve: Curves.easeIn, duration: Duration(milliseconds: 100));*/
    } else if (_scroll < (_maxScroll - _bulletContainerWidth) &&
        _swipeDirection == IntroSwipeDirection.LEFT_TO_RIGHT) {
      /*_scrollController.animateTo(_scroll,
          curve: Curves.easeIn, duration: Duration(milliseconds: 100));*/
    } else if (_swipeDirection == IntroSwipeDirection.SKIP_TO_LAST) {
      /*_scrollController.animateTo(_maxScroll,
          curve: Curves.easeIn, duration: Duration(milliseconds: 100));*/
    }
  }
}

class AnimatedOnBoardIntro extends StatefulWidget {
  final Widget? child;
  final OnBoardIntroAnimator animator;

  const AnimatedOnBoardIntro(
      {Key? key, required this.animator, required this.child})
      : super(key: key);

  @override
  State<AnimatedOnBoardIntro> createState() => _AnimatedOnBoardIntroState();
}

class _AnimatedOnBoardIntroState extends State<AnimatedOnBoardIntro> {
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    if (mounted) widget.animator.getController().forward(from: 0.0);
  }

  @override
  Widget build(BuildContext context) {
    //
    return Transform.scale(
      scale: widget.animator.getAnimator().value,
      child: new Padding(
        padding: new EdgeInsets.only(bottom: 25.0),
        child: widget.child,
      ),
    ); /*Transform(
      transform: new Matrix4.translationValues(
          0.0, 50.0 * (1.0 - animator.getAnimator().value), 0.0),
      child: new Padding(
        padding: new EdgeInsets.only(bottom: 25.0),
        child: child,
      ),
    );*/
  }
}

class AnimatedText extends StatelessWidget {
  final Widget? child;
  final OnBoardIntroAnimator animator;

  const AnimatedText({Key? key, required this.animator, required this.child})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Transform(
      transform: new Matrix4.translationValues(
          80 * (1.0 - animator.getAnimator().value), 0.0, 0.0),
      child: child,
    );
  }
}

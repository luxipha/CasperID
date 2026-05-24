import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/views/pages/home/home_page.dart';
import 'package:highfedilityadevar/views/pages/profile/profile_page.dart';

import 'consts/app_colors.dart';
import 'consts/app_images.dart';

class BaseBottom extends StatefulWidget {
  @override
  _BaseBottomState createState() => _BaseBottomState();
}

enum ExpansionStatus { open, close, idle }

class _BaseBottomState extends State<BaseBottom>
    with SingleTickerProviderStateMixin {
  int _selectedIndex = 0;
  ExpansionStatus expansionStatus = ExpansionStatus.idle;
  bool isOpened = false;
  late AnimationController _animationController;
  late Animation<double> _translateButton;
  Curve _curve = Curves.easeOut;

  double getRadiansFromDegree(double degree) {
    double unitRadian = 57.295779513;
    return degree / unitRadian;
  }

  animate() {
    if (!isOpened) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
    isOpened = !isOpened;
  }

  @override
  void initState() {
    _animationController =
        AnimationController(vsync: this, duration: Duration(milliseconds: 100))
          ..addListener(() {
            setState(() {});
          });
    _translateButton = Tween<double>(
      begin: 56,
      end: -14.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Interval(
        0.0,
        0.75,
        curve: _curve,
      ),
    ));
    super.initState();
  }

  @override
  dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Widget add() {
    return InkWell(
      onTap: () {
        print('object');
      },
      child: Image(
        image: AssetImage(AppImages.BOTTOM_LEFT_OPTION),
        height: 46,
        width: 46,
      ),
    );
  }

  Widget image() {
    return InkWell(
      onTap: () {
        print('object');
      },
      child: Container(
        child: Image(
            image: AssetImage(AppImages.BOTTOM_RIGHT_OPTION),
            height: 46,
            width: 46),
      ),
    );
  }

  final width = Get.width;

  @override
  Widget build(BuildContext context) {
    final bool shouldOpen = expansionStatus == ExpansionStatus.open;
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: <Widget>[
              Expanded(
                child: IndexedStack(
                  index: _selectedIndex,
                  children: [
                    HomePage(
                      from: "",
                    ),
                    ProfilePage(),
                  ],
                ),
              ),
              Container(
                height: 70,
              ),
              /* Positioned(
                bottom: 0,
                left: 0,
                child: SpinCircleBottomBar(
                  bottomNavigationBar: bottomNavigationBar,
                ),
              ),*/
            ],
          ),
          Positioned(
            bottom: 0,
            left: 0,
            child: Container(
              height: 70 * 2,
              width: Get.width,
              //color: AppColors.greenColor,
              //color: Colors.transparent,
              padding: EdgeInsets.only(bottom: Platform.isIOS ? 15 : 0),

              child: Stack(
                fit: StackFit.expand,
                clipBehavior: Clip.none,
                children: [
                  if (expansionStatus != ExpansionStatus.idle) ...[
                    SizedBox(
                        width: width,
                        height: 70 * 2,
                        child: Stack(
                          children: <Widget>[
                            /*  TweenAnimationBuilder(
                              tween: Tween<double>(
                                  begin: shouldOpen ? -3.14 : 0,
                                  end: shouldOpen ? 0 : -3.14),
                              curve: Curves.easeInOutQuad,
                              duration: Duration(
                                  milliseconds: shouldOpen ? 500 : 800),
                              builder: (BuildContext context, double value,
                                  Widget? child) {
                                return Transform(
                                  transform: Matrix4.translationValues(
                                    _translateButton.value * 3.0,
                                    _translateButton.value * 4.0,
                                    0.0,
                                  ),
                                  child: child,
                                ); */ /*Transform.rotate(
                                  angle: value,
                                  alignment: Alignment.bottomCenter,
                                  child: child,
                                );*/ /*
                              },
                              child: EmptyLayer(
                                radius: 70 * 2,
                                color: Colors.green,
                              ),
                            ),
                            TweenAnimationBuilder(
                              tween: Tween<double>(
                                  begin: shouldOpen ? -3.14 : 0,
                                  end: shouldOpen ? 0 : -3.14),
                              curve: Curves.easeInOutQuad,
                              duration: const Duration(milliseconds: 600),
                              builder: (BuildContext context, double value,
                                  Widget? child) {
                                return Transform.rotate(
                                  angle: value,
                                  alignment: Alignment.bottomCenter,
                                  child: child,
                                );
                              },
                              child: EmptyLayer(
                                radius: 70 * 2,
                                color: Colors.blue,
                              ),
                            ),*/
                            TweenAnimationBuilder(
                              tween: Tween<double>(
                                  begin: shouldOpen ? -3.14 : 0,
                                  end: shouldOpen ? 0 : -3.14),
                              duration: Duration(
                                  milliseconds: shouldOpen ? 800 : 500),
                              curve: Curves.easeInOutQuad,
                              builder: (BuildContext context, double value,
                                  Widget? child) {
                                return Transform(
                                  transform: Matrix4.translationValues(
                                    value * 3.0,
                                    value * 4.0,
                                    0.0,
                                  ),
                                  /*angle: value,
                                  alignment: Alignment.bottomCenter,*/

                                  child: child,
                                );
                              },
                              child: ItemNames(
                                circleItems: [
                                  //Suggested Count: 3
                                  ItemModel(
                                      icon: Icon(Icons.add),
                                      onPressed: () {
                                        print('ONE');
                                      }),
                                  ItemModel(
                                      icon: Icon(Icons.print),
                                      onPressed: () {
                                        print('2');
                                      }),
                                  ItemModel(
                                      icon: Icon(Icons.map),
                                      onPressed: () {
                                        print('3');
                                      }),
                                ],
                                radius: 70 * 2,
                                color: AppColors.WHITE,
                              ),
                            ),
                          ],
                        ))
                  ],
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: Container(
                      width: double.infinity,
                      height: 49,
                      color: AppColors.BOTTOM_NAV_COLOR,
                      child: Row(
                        children: [
                          InkWell(
                            onTap: () {
                              if (_selectedIndex == 0) return;
                              setState(() {
                                _selectedIndex = 0;
                              });
                            },
                            child: Container(
                              width: Get.width * 0.5,
                              height: 49,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image(
                                    image:
                                        AssetImage(AppImages.BOTTOM_BAR_HOME),
                                    height: 20,
                                    width: 20,
                                    color: _selectedIndex == 0
                                        ? Colors.blue
                                        : Colors.grey,
                                  ),
                                  SizedBox(
                                    width: 10,
                                  ),
                                  Text(
                                    'Home',
                                    style: GoogleFonts.roboto(
                                        color: _selectedIndex == 0
                                            ? Colors.blue
                                            : Colors.grey,
                                        fontWeight: FontWeight.w700),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              if (_selectedIndex == 1) return;
                              setState(() {
                                _selectedIndex = 1;
                              });
                            },
                            child: Container(
                              width: Get.width * 0.5,
                              height: 49,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image(
                                    image: AssetImage(
                                        AppImages.BOTTOM_BAR_PROFILE),
                                    height: 20,
                                    width: 20,
                                    color: _selectedIndex == 1
                                        ? Colors.blue
                                        : Colors.grey,
                                  ),
                                  SizedBox(
                                    width: 10,
                                  ),
                                  Text(
                                    'Me',
                                    style: GoogleFonts.roboto(
                                        color: _selectedIndex == 1
                                            ? Colors.blue
                                            : Colors.grey,
                                        fontWeight: FontWeight.w700),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    height: 70 * 2,
                    //   color: Colors.black,
                    width: MediaQuery.of(context).size.width,
                    alignment: Alignment.center,
                    child: TweenAnimationBuilder(
                      tween: Tween<double>(
                          begin: shouldOpen ? 0.0 : 6.28319,
                          end: shouldOpen ? 6.28319 : 0),
                      duration: const Duration(milliseconds: 250),
                      builder:
                          (BuildContext context, double angle, Widget? child) {
                        return Transform.rotate(
                            angle: expansionStatus == ExpansionStatus.idle
                                ? 0.0
                                : angle,
                            child: child);
                      },
                      child: FloatingActionButton(
                        elevation: 2,
                        backgroundColor: AppColors.BUTTON_COLOR,
                        onPressed: () {
                          if (expansionStatus == ExpansionStatus.idle) {
                            setState(() {
                              expansionStatus = ExpansionStatus.open;
                            });
                          } else {
                            setState(() {
                              expansionStatus =
                                  (expansionStatus == ExpansionStatus.open)
                                      ? ExpansionStatus.close
                                      : ExpansionStatus.open;
                            });
                          }
                        },
                        child: shouldOpen
                            ? Image(
                                image: AssetImage(AppImages.BOTTOM_BAR),
                              )
                            : Image(
                                image: AssetImage(AppImages.BOTTOM_BAR),
                              ),
                      ),
                    ),
                  ),
                  /*Container(
                    height: 70 * 2,
                    width: width,

                    alignment: Alignment.center,
                    child: Stack(
                      fit: StackFit.expand,
                      clipBehavior: Clip.none,
                      children: [
                        Transform(
                          transform: Matrix4.translationValues(
                            _translateButton.value * 3.0,
                            _translateButton.value * 4.0,
                            0.0,
                          ),
                          child: add(),
                        ),
                        Transform(
                          transform: Matrix4.translationValues(
                            0.0 - _translateButton.value * 3.0,
                            _translateButton.value * 4.0,
                            0.0,
                          ),
                          child: image(),
                        ),
                        GestureDetector(
                          onTap: (){
                            print(_translateButton.value);
                            animate();
                          },
                          child: Container(
                            height: 60,
                            width: 60,
                            child: Image(image: AssetImage(AppImages.BOTTOM_BAR)),
                          ),
                        ),
                      ],
                    ),
                  )*/
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ItemNames extends StatelessWidget {
  final List<ItemModel> circleItems;
  final Color color;
  final double radius;

  const ItemNames(
      {Key? key,
      required this.color,
      required this.radius,
      required this.circleItems})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double radianGap = 3.14159 / circleItems.length;
    final double start = radianGap / 2;
    return ClipRect(
      child: Align(
        heightFactor: 0.5,
        alignment: Alignment.topCenter,
        child: Container(
          width: radius,
          height: radius,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
          child: Center(
            child: Stack(
              fit: StackFit.expand,
              clipBehavior: Clip.none,
              children: circleItems.asMap().entries.map((entry) {
                final ItemModel value = entry.value;
                return Transform.translate(
                    offset: Offset.fromDirection(
                        -(start + (entry.key * radianGap)), radius / 3),
                    child: GestureDetector(
                      onTap: value.onPressed,
                      child: value.icon,
                    ));
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class ItemModel {
  Icon icon;
  void Function() onPressed;

  ItemModel({required this.icon, required this.onPressed});
}

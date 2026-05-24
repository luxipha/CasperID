import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/SessionManager.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/home/home_page.dart';
import 'package:highfedilityadevar/views/pages/id_card_qr_code_base/id_card_qr_code_base_page.dart';
import 'package:highfedilityadevar/views/pages/profile/profile_page.dart';
import 'package:highfedilityadevar/views/widgets/bottom_bar_actions.dart';
import 'package:highfedilityadevar/views/widgets/modals.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../bas_bottom.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import '../scanning_qr_code/scanning_qr_code_page.dart';

class HomeBasePage extends StatefulWidget {
  // final from;
  int selectedIndex;

  HomeBasePage({Key? key, this.selectedIndex = 0}) : super(key: key);

  @override
  _HomeBasePageState createState() => _HomeBasePageState();
}

enum ExpansionStatus { open, close, idle }

class _HomeBasePageState extends State<HomeBasePage> with SingleTickerProviderStateMixin, BaseClass {
  bool isOpened = false;
  late AnimationController _animationController;
  late Animation<double> _translateButton;
  Curve _curve = Curves.easeOut;
  bool isUserProfileUpdated = false;

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
    _pageIndex = widget.selectedIndex;
    _animationController = AnimationController(vsync: this, duration: Duration(milliseconds: 100))
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
    // awaitUserPref();
  }

  @override
  dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Widget add() {
    return Image(
      image: AssetImage(AppImages.BOTTOM_LEFT_OPTION),
      height: 46,
      width: 46,
    );
  }

  Widget image() {
    return Image(image: AssetImage(AppImages.BOTTOM_RIGHT_OPTION), height: 46, width: 46);
  }

  final width = Get.width;
  ExpansionStatus expansionStatus = ExpansionStatus.idle;
  static List<Widget> widgetList = <Widget>[
    HomePage(from: ""),
    ProfilePage(),
  ];
  int _pageIndex = 0;
  void onPageChangedIndex(int index) {
    setState(() {
      _pageIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      body: Stack(
        children: [
          widgetList.elementAt(_pageIndex),
          if (expansionStatus != ExpansionStatus.idle) ...[
            SizedBox(
                width: width,
                // height: 70 * 2,

                //   alignment: Alignment.center,
                child: Align(
                  alignment: Alignment.center,
                  child: Stack(children: [
                    /* Transform(
                              transform: Matrix4.translationValues(
                                _translateButton.value * 3,
                                _translateButton.value * 4.0,
                                0.0,
                              ),*/
                    Transform.translate(
                      offset: Offset(
                        _translateButton.value * 4,
                        _translateButton.value * 3,
                      ),
                      child: Stack(
                        children: [
                          Align(
                            alignment: Alignment.bottomCenter,
                            child: TextButton(
                                onPressed: () {
                                  animate();
                                  Get.to(() => ScanningQrCodePage(isPublicQr: false));
/*                                          Get.to(() => IdCardQrCodeBasePage());*/
                                },
                                child: Container(
                                  height: 46,
                                  width: 46,
                                  child: Image(
                                    image: AssetImage(AppImages.BOTTOM_LEFT_OPTION),
                                  ),
                                )),
                          )
                        ],
                      ),
                    ),
                    Transform.translate(
                      /*  transform: Matrix4.translationValues(
                                0.0 - _translateButton.value * 2.0,
                                _translateButton.value * 2.5,
                                0.0,
                              ),*/
                      offset: Offset(
                        0.0 - _translateButton.value * 4,
                        _translateButton.value * 3,
                      ),
                      child: Stack(
                        children: [
                          Align(
                            alignment: Alignment.bottomCenter,
                            child: TextButton(
                                onPressed: () {
                                  animate();
                                  Get.to(() => IdCardQrCodeBasePage());
                                },
                                child: Container(
                                  height: 46,
                                  width: 46,
                                  child: Image(
                                    image: AssetImage(AppImages.BOTTOM_RIGHT_OPTION),
                                  ),
                                )),
                          )
                        ],
                      ),
                    ),
                  ]),
                ))
          ],
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          print(_translateButton.value);

          if (expansionStatus == ExpansionStatus.idle) {
            setState(() {
              expansionStatus = ExpansionStatus.open;
            });
          } else {
            setState(() {
              expansionStatus =
                  (expansionStatus == ExpansionStatus.open) ? ExpansionStatus.close : ExpansionStatus.open;
            });
          }
          animate();
        },
        child: Container(
          width: width,
          alignment: Alignment.center,
          child: Image(
            image: AssetImage(AppImages.BOTTOM_BAR),
            height: 60,
            width: 60,
          ),
        ),
      ),

      bottomNavigationBar: BottomNavigationBar(
        // iconSize: 20,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.BOTTOM_NAV_COLOR,
        onTap: (int index) {
          onPageChangedIndex(index);
        },
        items: [
          BottomNavigationBarItem(
            icon: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _pageIndex == 0
                    ? Image.asset(
                        AppImages.BOTTOM_BAR_HOME_SELECTED,
                        height: 22,
                        width: 22,
                      )
                    : Image.asset(
                        AppImages.BOTTOM_BAR_HOME,
                        height: 22,
                        width: 22,
                      ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Home",
                  style: GoogleFonts.roboto(
                      color: _pageIndex == 0 ? Colors.blue : Colors.grey, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            label: "",
          ),
          BottomNavigationBarItem(
            icon: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _pageIndex == 1
                    ? Image.asset(
                        AppImages.BOTTOM_BAR_PROFILE,
                        height: 22,
                        width: 22,
                      )
                    : Image.asset(
                        AppImages.BOTTOM_BAR_PROFILE_UNSELECTED,
                        height: 22,
                        width: 22,
                      ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Me",
                  style: GoogleFonts.roboto(
                      color: _pageIndex == 1 ? Colors.blue : Colors.grey, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            label: "",
          )
        ],
      ),
//        Stack(
//         children: [
//           Column(
//             children: [
//               Expanded(
//                 child: IndexedStack(
//                   index: _selectedIndex,
//                   children: [
      // HomePage(from: widget.from),
      // ProfilePage(),
//                   ],
//                 ),
//               ),
//               Container(
//                 height: 70,
//               ),
//             ],
//           ),
//           Positioned(
//             bottom: 0,
//             left: 0,
//             child: Container(
//               height: 70 * 2,
//               width: Get.width,
//               //color: AppColors.red,
//               color: Colors.transparent,
//               padding: EdgeInsets.only(bottom: Platform.isIOS ? 15 : 0),
//               child: Stack(
//                 fit: StackFit.expand,
//                 clipBehavior: Clip.none,
//                 children: [
//                   if (expansionStatus != ExpansionStatus.idle) ...[
//                     SizedBox(
//                       width: width,
//                       height: 70 * 2,

//                       //   alignment: Alignment.center,
//                       child: Align(
//                         alignment: Alignment.center,
//                         child: Stack(
//                           children: [
//                             /* Transform(
//                               transform: Matrix4.translationValues(
//                                 _translateButton.value * 3,
//                                 _translateButton.value * 4.0,
//                                 0.0,
//                               ),*/
//                             Transform.translate(
//                               offset: Offset(
//                                 _translateButton.value * 3,
//                                 _translateButton.value * 4,
//                               ),
//                               child: Stack(
//                                 children: [
//                                   Align(
//                                     alignment: Alignment.center,
//                                     child: FlatButton(
//                                         onPressed: () {
//                                           animate();
//                                           Get.to(() => ScanningQrCodePage(
//                                               isPublicQr: false));
// /*                                          Get.to(() => IdCardQrCodeBasePage());*/
//                                         },
//                                         child: Container(
//                                           height: 46,
//                                           width: 46,
//                                           child: Image(
//                                             image: AssetImage(
//                                                 AppImages.BOTTOM_LEFT_OPTION),
//                                           ),
//                                         )),
//                                   )
//                                 ],
//                               ),
//                             ),
//                             Transform.translate(
//                               /*  transform: Matrix4.translationValues(
//                                 0.0 - _translateButton.value * 2.0,
//                                 _translateButton.value * 2.5,
//                                 0.0,
//                               ),*/
//                               offset: Offset(
//                                 0.0 - _translateButton.value * 3,
//                                 _translateButton.value * 4,
//                               ),
//                               child: Stack(
//                                 children: [
//                                   Align(
//                                     alignment: Alignment.center,
//                                     child: FlatButton(
//                                         onPressed: () {
//                                           animate();
//                                           Get.to(() => IdCardQrCodeBasePage());
//                                         },
//                                         child: Container(
//                                           height: 46,
//                                           width: 46,
//                                           child: Image(
//                                             image: AssetImage(
//                                                 AppImages.BOTTOM_RIGHT_OPTION),
//                                           ),
//                                         )),
//                                   )
//                                 ],
//                               ),
//                             ),
//                           ],
//                         ),
//                       ),
//                     ),
//                   ],
//                   Align(
//                     alignment: Alignment.bottomCenter,
//                     child: Container(
//                       width: double.infinity,
//                       height: 49,
//                       color: AppColors.BOTTOM_NAV_COLOR,
//                       child: Row(
//                         children: [
//                           InkWell(
//                             onTap: () {
//                               if (isOpened) {
//                                 _animationController.reverse();
//                               }
//                               isOpened = !isOpened;
//                               if (_selectedIndex == 0) return;
//                               setState(() {
//                                 _selectedIndex = 0;
//                                 // Get.offAll(() => HomeBasePage());
//                                 // showCircularDialog(context);
//                                 // HomePageState().getPersonViewData();
//                                 // HomePageState().getLastMeeting();
//                                 // HomePageState().getRecentContacts();
//                                 // HomePageState().getRecentComments();
//                                 // Future.delayed(Duration(seconds: 3), () {
//                                 //   Navigator.pop(context);
//                                 // });
//                               });
//                             },
//                             child: Container(
//                               width: Get.width * 0.5,
//                               height: 49,
//                               child: Row(
//                                 mainAxisAlignment: MainAxisAlignment.center,
//                                 children: [
//                                   Image(
//                                     image: _selectedIndex == 0
      // ? AssetImage(
      //     AppImages.BOTTOM_BAR_HOME_SELECTED)
      // : AssetImage(AppImages.BOTTOM_BAR_HOME),
//                                     height: 20,
//                                     width: 20,
//                                     color: _selectedIndex == 0
//                                         ? Colors.blue
//                                         : Colors.grey,
//                                   ),
//                                   SizedBox(
//                                     width: 10,
//                                   ),
//                                   Text(
//                                     'Home',
      // style: GoogleFonts.roboto(
      //     color: _selectedIndex == 0
      //         ? Colors.blue
      //         : Colors.grey,
      //     fontWeight: FontWeight.w700),
//                                   ),
//                                 ],
//                               ),
//                             ),
//                           ),
//                           InkWell(
//                             onTap: () {
//                               if (isOpened) {
//                                 _animationController.reverse();
//                               }
//                               isOpened = !isOpened;
//                               if (_selectedIndex == 1) return;
//                               setState(() {
//                                 _selectedIndex = 1;
//                                 // Get.offAll(() => HomeBasePage(
//                                 //       from: "editProfile",
//                                 //     ));

//                                 // showCircularDialog(context);
//                                 // ProfilePageState().getUserProfile();
//                                 // ProfilePageState().getShareData();
//                                 // Future.delayed(Duration(seconds: 3), () {
//                                 //   Navigator.pop(context);
//                                 // });
//                               });
//                             },
//                             child: Container(
//                               width: Get.width * 0.5,
//                               height: 49,
//                               child: Row(
//                                 mainAxisAlignment: MainAxisAlignment.center,
//                                 children: [
//                                   Image(
//                                     image: _selectedIndex == 1
      // ? AssetImage(
      //     AppImages.BOTTOM_BAR_PROFILE)
      // : AssetImage(AppImages
      //     .BOTTOM_BAR_PROFILE_UNSELECTED),
//                                     height: 20,
//                                     width: 20,
//                                     color: _selectedIndex == 1
//                                         ? Colors.blue
//                                         : Colors.grey,
//                                   ),
//                                   SizedBox(
//                                     width: 10,
//                                   ),
//                                   Text(
//                                     'Me',
//                                     style: GoogleFonts.roboto(
//                                         color: _selectedIndex == 1
//                                             ? Colors.blue
//                                             : Colors.grey,
//                                         fontWeight: FontWeight.w700),
//                                   ),
//                                 ],
//                               ),
//                             ),
//                           ),
//                         ],
//                       ),
//                     ),
//                   ),
      // GestureDetector(
      //   onTap: () {
      //     print(_translateButton.value);

      //     if (expansionStatus == ExpansionStatus.idle) {
      //       setState(() {
      //         expansionStatus = ExpansionStatus.open;
      //       });
      //     } else {
      //       setState(() {
      //         expansionStatus =
      //             (expansionStatus == ExpansionStatus.open)
      //                 ? ExpansionStatus.close
      //                 : ExpansionStatus.open;
      //       });
      //     }
      //     animate();
      //   },
      //   child: Container(
      //     height: 70 * 2,
      //     width: width,
      //     alignment: Alignment.center,
      //     margin: EdgeInsets.only(top: 60),
      //     child: Image(
      //       image: AssetImage(AppImages.BOTTOM_BAR),
      //       height: 60,
      //       width: 60,
      //     ),
      //   ),
//                   ),
//                 ],
//               ),
//             ),
//           ),
      //   ],
      // ),
    );
  }

  // void awaitUserPref() async {
  //   if (widget.from == "editProfile") {
  //     _selectedIndex = 1;
  //   } else {
  //     _selectedIndex = 0;
  //   }
  //   setState(() {});
  // }
}

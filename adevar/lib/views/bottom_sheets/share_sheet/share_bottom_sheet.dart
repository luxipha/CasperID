import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:social_share/social_share.dart';

class ShareBottomSheet {
  void showUploadImageActionSheet(BuildContext context) {
    showModalBottomSheet<dynamic>(
        barrierColor: Colors.black.withOpacity(0.3),
        backgroundColor: Colors.transparent,
        isDismissible: true,
        context: context,
        isScrollControlled: true,
        elevation: 15,
        builder: (BuildContext bc) {
          return BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
            child: Container(
              padding:
                  EdgeInsets.only(top: 20, /*bottom: 30,*/ left: 20, right: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Wrap(
                children: <Widget>[

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.wechat),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('WeChat', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            SizedBox(height: 15,),
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.wechat_moment),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('WeChat\nmoment', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.qq),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('QQ', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.qq_zone),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('QQ zone', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.weibo),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('Weibo', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                    ],
                  ),
                  Container(
                    margin: EdgeInsets.only(top: 20),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.fb),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('Facebook', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {

                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.insta),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('Instagram', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.telegram),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('Telegram', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.twitter),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('Twitter', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Column(
                          children: [
                            Container(
                              margin: EdgeInsets.only(bottom: 10),
                              child: Center(
                                child: Image(
                                  image: AssetImage(AppImages.llink),
                                  height: 50,
                                  width: 50,
                                ),
                              ),
                            ),
                            Text('Link', textAlign: TextAlign.center,style: GoogleFonts.roboto(color: Colors.black,fontSize: 12,fontWeight: FontWeight.w400),)
                          ],
                        ),
                      ),
                    ],
                  ),
                  Container(
                    margin: EdgeInsets.only(top: 30),
                  ),
                ],
              ),
            ),
          );
        });
  }
}

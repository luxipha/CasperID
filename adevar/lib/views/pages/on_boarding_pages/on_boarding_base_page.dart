import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/pages/on_boarding_pages/on_boarding_page_one/on_boarding_page_one.dart';
import 'package:highfedilityadevar/views/pages/on_boarding_pages/on_boarding_page_three.dart';
import 'package:highfedilityadevar/views/pages/on_boarding_pages/on_boarding_page_two.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';

class OnBoardingBasePage extends StatefulWidget {
  @override
  _OnBoardingBasePageState createState() => _OnBoardingBasePageState();
}

class _OnBoardingBasePageState extends State<OnBoardingBasePage> {
  late PageController _pageController;
  int sliderIndex = 0;
  List<Widget> imageSliders = [];
  int _current = 0;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    imageSliders.add(OnBoardingPageOne(
        assetImage: AppImages.onboard_one,
        title: 'Meet People with Similar Interests',
        subTitle: 'Explore New Restaurants And Cuisines!'));
    imageSliders.add(OnBoardingPageTwo(
        assetImage: AppImages.onboard_two,
        title: 'Earn Coupons with Every Meetup',
        subTitle: 'Get Amazing Discounts and Offers And\nSave Money'));
    imageSliders.add(OnBoardingPageThree(
        assetImage: AppImages.onboard_three,
        title: 'Grow Your Social Circle',
        subTitle:
        'Get Instant Universal Updates about New\nSocial Challenges and Discounts'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _current == 0
          ? AppColors.ON_BOARD_ONE
          : _current == 1
          ? AppColors.ON_BOARD_TWO
          : AppColors.ON_BOARD_THREE,
      body: Stack(
        //mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Column(
            children: [
              SizedBox(height: 8,),
              CarouselSlider(
                items: imageSliders,

                options: CarouselOptions(
                    autoPlay: false,
                    height: Get.height * 0.53,

                    viewportFraction: 1.0,
                    enlargeCenterPage: false,
                    enableInfiniteScroll: false,
                    onPageChanged: (index, reason) {
                      setState(() {
                        _current = index;
                      });
                    }),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: imageSliders.map((url) {
                  int index = imageSliders.indexOf(url);
                  return Container(
                    width: _current == index ? 24.0 : 12.0,
                    height: _current == index ? 6.0 : 12.0,
                    margin: EdgeInsets.symmetric(horizontal: 10.0),
                    decoration: BoxDecoration(
                      shape: BoxShape.rectangle,
                      borderRadius: BorderRadius.circular(8),
                      color: _current == index
                          ? AppColors.BUTTON_COLOR
                          : AppColors.FORM_GREY,
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: Get.height * 0.4,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Column(
                    children: [
                      SizedBox(
                        height: 40,
                      ),
                      Container(
                          margin: EdgeInsets.only(left: 16, right: 16),
                          child: _current == 0
                              ? Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Your second ',
                                  style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                TextSpan(
                                  text: 'ID card',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.BUTTON_COLOR,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          )
                              : _current == 1
                              ? Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Make ',
                                  style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                TextSpan(
                                  text: 'friends ',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.BUTTON_COLOR,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                TextSpan(
                                  text: 'offline',
                                  style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          )
                              : Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Privacy protection ',
                                  style: GoogleFonts.roboto(
                                    color: AppColors.BUTTON_COLOR,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                TextSpan(
                                  text: '\nauthority authentication',
                                  style: GoogleFonts.roboto(
                                    color: Colors.black,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                            textAlign: TextAlign.center,
                          ) /*Text(
                          _current == 0
                              ? 'Your second ID card'
                              : _current == 1
                                  ? 'Make friends offline'
                                  : 'Privacy protection\nauthority authentication',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                          ),
                        ),*/
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      Container(
                        margin: EdgeInsets.only(left: 16, right: 16),
                        child: Text(
                          _current == 0
                              ? 'You can connect a lot of\ninformation through adavar'
                              : _current == 1
                              ? 'Make friends and get to\nknow people with common intentions'
                              : 'We will pay great attention to\nprotect your privacy, please rest\nassured to use',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.roboto(
                              color: AppColors.ON_BOARD_GREY,
                              fontSize: 16,
                              fontWeight: FontWeight.w400),
                        ),
                      ),
                    ],
                  ),
                  _current != 2
                      ? GestureDetector(
                    onTap: () {
                      setState(() {
                        if (_current == 0) {
                          _current = 1;
                        } else if (_current == 1) {
                          _current = 2;
                        }
                      });
                    },
                    child: Container(
                      height: 52,
                      width: 52,
                      margin: EdgeInsets.only(bottom: 30),
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _current == 0
                              ? AppColors.ON_BOARD_BUTTON_ONE
                              : AppColors.ON_BOARD_BUTTON_TWO),
                      child: Icon(
                        Icons.arrow_forward_outlined,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  )
                      : GestureDetector(
                    onTap: () {
                      Get.to(() => RegisterPhoneNumberPage());
                    },
                    child: Container(
                      height: 52,
                      width: 154,
                      margin: EdgeInsets.only(bottom: 30),
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(61),
                          color: AppColors.ON_BOARD_BUTTON_THREE),
                      child: Center(
                        child: Text(
                          'Get Started',
                          style: GoogleFonts.roboto(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

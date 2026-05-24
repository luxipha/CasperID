import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/me_user_profile_controller/UpdateUserProfileController.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/home/myPersonView_model.dart';
import 'package:highfedilityadevar/models/me_user_model/GetUserInfoModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/SessionManager.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/edit_profile_page.dart';
import 'package:highfedilityadevar/views/pages/profile/profile_page.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class VerifiedAccountPage extends StatefulWidget {
  MyPersonViewModel? userDataModel;
  VerifiedAccountPage({Key? key, this.userDataModel}) : super(key: key);
  @override
  _VerifiedAccountPageState createState() => _VerifiedAccountPageState();
}

class _VerifiedAccountPageState extends State<VerifiedAccountPage>
    with BaseClass {
  GetUserInfoModel? getUserInfoModel;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final UpdateUserProfileController _updateUserProfileController =
      Get.isRegistered<UpdateUserProfileController>()
          ? Get.find<UpdateUserProfileController>()
          : Get.put(UpdateUserProfileController());
  UserDataModel? userDataModel;
  void getUserInfo() async {
    userDataModel = await _getSharedPref.getUserData();
    UserPref.userPref = await SharedPreferences.getInstance();
    try {
      getUserInfoModel = await _updateUserProfileController
          .getUserInfo(userDataModel!.authToken!);
      if (getUserInfoModel!.flag!) {
        showSuccess(title: "Success", message: getUserInfoModel!.message!);

        setState(() {
          // userDataModel;
          // getUserInfoModel;
        });
      } else {
        // throw getUserInfoModel!.message!;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error 2", message: error.toString());
    }
  }

  @override
  void initState() {
    // TODO: implement initState
    getUserInfo();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
      ),
      body: Container(
        margin: EdgeInsets.symmetric(horizontal: 30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 60,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    height: 53,
                    width: 41,
                    child: Image(
                      image: AssetImage(AppImages.VERIFIED_BADGE),
                    ),
                  ),
                  SizedBox(
                    width: 18,
                  ),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Text(
                      widget.userDataModel != null
                          ? widget.userDataModel!.data!.completenessOfInfo!
                              .proportion!
                          : "0%",
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontWeight: FontWeight.w700,
                          fontSize: 36),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 20,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Stack(
                //   children: <Widget>[
                //     Container(
                //       height: 14,
                //       width: Get.width - 120,
                //       margin: EdgeInsets.only(left: 15),
                //       decoration: BoxDecoration(
                //         borderRadius: BorderRadius.only(
                //           topLeft: Radius.circular(50),
                //           bottomLeft: Radius.circular(50),
                //         ),
                //         color: AppColors.FORM_GREY,
                //       ),
                //     ),
                //     Container(
                //       height: 14,
                //       width: (Get.width - 120) / 2,
                //       margin: EdgeInsets.only(left: 15),
                //       decoration: BoxDecoration(
                //         borderRadius: BorderRadius.only(
                //           topLeft: Radius.circular(50),
                //           bottomLeft: Radius.circular(50),
                //         ),
                //         color: Colors.blue,
                //       ),
                //     ),
                //   ],
                // ),
                Expanded(
                  child: LinearPercentIndicator(
                    padding: EdgeInsets.zero,
                    backgroundColor: Colors.grey.shade200,
                    progressColor: Colors.blue,
                    lineHeight: 10,
                    percent: double.parse(
                      (int.parse(widget.userDataModel!.data!.completenessOfInfo!
                                  .proportion!
                                  .replaceAll('%', '')
                                  .toString()) /
                              100)
                          .toString(),
                    ),
                  ),
                ),

                Container(
                  height: 30,
                  width: 30,
                  margin: EdgeInsets.only(right: 15),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: widget.userDataModel!.data!.completenessOfInfo!
                                .proportion ==
                            "100%"
                        ? Colors.blue
                        : Colors.grey.shade200,
                  ),
                  child: Icon(
                    Icons.check,
                    color: widget.userDataModel!.data!.completenessOfInfo!
                                .proportion ==
                            "100%"
                        ? Colors.white
                        : Colors.grey,
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 70,
            ),
            Text(
              'Task:',
              style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontWeight: FontWeight.w700,
                  fontSize: 24),
            ),
            SizedBox(
              height: 23,
            ),
            // Container(
            //     padding: EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            //     decoration: BoxDecoration(
            //       color: AppColors.FORM_GREY,
            //       borderRadius: BorderRadius.circular(15),
            //     ),
            //     width: double.infinity,
            //     child: ListTile(
            //       contentPadding: EdgeInsets.zero,
            //       title: Text(
            //         'Facial Authentication',
            //         style: GoogleFonts.roboto(
            //             color: Colors.black,
            //             fontWeight: FontWeight.w400,
            //             fontSize: 14),
            //       ),
            //       subtitle: Container(
            //         margin: EdgeInsets.only(top: 8),
            //         child: Text(
            //           'It is a long established fact that a reader\nwill be distracted',
            //           style: GoogleFonts.roboto(
            //               color: Colors.grey,
            //               fontWeight: FontWeight.w400,
            //               fontSize: 12),
            //         ),
            //       ),
            //       trailing: Icon(
            //         Icons.arrow_forward_ios_rounded,
            //         color: AppColors.LIGHT_GREY,
            //         size: 20,
            //       ),
            //     )),
            // SizedBox(
            //   height: 23,
            // ),
            // Container(
            //     padding: EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            //     decoration: BoxDecoration(
            //       color: AppColors.FORM_GREY,
            //       borderRadius: BorderRadius.circular(15),
            //     ),
            //     width: double.infinity,
            //     child: ListTile(
            //       contentPadding: EdgeInsets.zero,
            //       title: Text(
            //         'Real Name Authenticat',
            //         style: GoogleFonts.roboto(
            //             color: Colors.black,
            //             fontWeight: FontWeight.w400,
            //             fontSize: 14),
            //       ),
            //       subtitle: Container(
            //         margin: EdgeInsets.only(top: 8),
            //         child: Text(
            //           'It is a long established fact that a reader\nwill be distracted',
            //           style: GoogleFonts.roboto(
            //               color: Colors.grey,
            //               fontWeight: FontWeight.w400,
            //               fontSize: 12),
            //         ),
            //       ),
            //       trailing: Icon(
            //         Icons.arrow_forward_ios_rounded,
            //         color: AppColors.LIGHT_GREY,
            //         size: 20,
            //       ),
            //     )),
            // SizedBox(
            //   height: 23,
            // ),
            // InkWell(
            //   onTap: () {
            //     Get.to(
            //       () => EditProfilePage(),
            //     );
            //   },
            //   child: Container(
            //       padding: EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            //       decoration: BoxDecoration(
            //         color: AppColors.FORM_GREY,
            //         borderRadius: BorderRadius.circular(15),
            //       ),
            //       width: double.infinity,
            //       child: ListTile(
            //         contentPadding: EdgeInsets.zero,
            //         title: Text(
            //           'Education',
            //           style: GoogleFonts.roboto(
            //               color: Colors.black,
            //               fontWeight: FontWeight.w400,
            //               fontSize: 14),
            //         ),
            //         subtitle: Container(
            //           margin: EdgeInsets.only(top: 8),
            //           child: Text(
            //             'It is a long established fact that a reader\nwill be distracted',
            //             style: GoogleFonts.roboto(
            //                 color: Colors.grey,
            //                 fontWeight: FontWeight.w400,
            //                 fontSize: 12),
            //           ),
            //         ),
            //         trailing: Icon(
            //           Icons.arrow_forward_ios_rounded,
            //           color: AppColors.LIGHT_GREY,
            //           size: 20,
            //         ),
            //       )),
            // ),
            // listTile(
            //   AppImages.PERSONAL_INFORMATION,
            //   'Personal Information',
            // ),
            InkWell(
              onTap: () {
                Get.to(() => EditProfilePage());
              },
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: AppColors.FORM_GREY,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Personal data',
                          style: GoogleFonts.roboto(
                            color: AppColors.DARK_GREY,
                            fontWeight: FontWeight.w600,
                            fontSize: 18,
                          ),
                        ),
                        Icon(
                          Icons.arrow_forward_ios,
                          color: AppColors.DARK_GREY,
                          size: 18,
                        )
                      ],
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    if (getUserInfoModel != null &&
                        getUserInfoModel!.data!.userInfo!.introduction
                                .toString() ==
                            '' &&
                        getUserInfoModel!.data!.userInfo!.introduction == null)
                      listTile(
                        AppImages.ADDRESS,
                        'Personal Introduction',
                      ),
                    if (getUserInfoModel != null &&
                        getUserInfoModel!.data!.userInfo!.address == null)
                      listTile(
                        AppImages.ADDRESS,
                        'Address',
                      ),
                    if (getUserInfoModel != null &&
                        getUserInfoModel!.data!.userInfo!.dateOfBirth == null)
                      listTile(
                        AppImages.BIRTHDAY,
                        'Date of birth',
                      ),
                    if (getUserInfoModel != null &&
                        getUserInfoModel!.data!.educations.isEmpty)
                      listTile(
                        AppImages.EDUCATION,
                        'Education',
                      ),
                    if (getUserInfoModel != null &&
                        getUserInfoModel!.data!.workExperiences.isEmpty)
                      listTile(
                        AppImages.WORK,
                        'Work Experience',
                      ),
                    if (getUserInfoModel != null &&
                        getUserInfoModel!.data!.userSkills.isEmpty)
                      listTile(
                        AppImages.SKILLS,
                        'Skills',
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget listTile(iconURL, title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Container(
            margin: EdgeInsets.only(right: 10),
            child: Image(
              image: AssetImage(
                iconURL,
              ),
              height: 20,
              width: 20,
            ),
          ),
          Text(
            title,
            style: GoogleFonts.roboto(
              textStyle: TextStyle(fontWeight: FontWeight.w400, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}

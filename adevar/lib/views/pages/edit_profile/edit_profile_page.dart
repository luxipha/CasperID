import 'dart:io';
import 'dart:math';
import 'package:flutter/scheduler.dart';
import 'package:highfedilityadevar/utils/process_indicator.dart';
import 'package:highfedilityadevar/views/pages/home_base/home_base_page.dart';
import 'package:highfedilityadevar/views/pages/profile/profile_page.dart';
import 'package:path/path.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/controllers/me_user_profile_controller/UpdateUserProfileController.dart';
import 'package:highfedilityadevar/controllers/me_user_profile_controller/UsersPreviousProfileModel.dart';
import 'package:highfedilityadevar/micheal_code/Service/Urls.dart';
import 'package:highfedilityadevar/micheal_screens/personal_data_success.dart';
import 'package:highfedilityadevar/models/me_user_model/GetUserInfoModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/utils.dart';
import 'package:highfedilityadevar/views/bottom_sheets/choose_file/choose_file_bottom_sheet.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/CropProfileImage.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import 'package:http_parser/http_parser.dart';
import '../../../models/me_user_model/UploadUserProfileModel.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';

import '../../../utils/AppDataNotifiier.dart';
import '../../../utils/SessionManager.dart';

class EditProfilePage extends StatefulWidget {
  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage>
    with BaseClass, WidgetsBindingObserver {
  bool setLevelOfEducationCustom = false;
  bool isMaleSelected = true;
  bool isFemaleSelected = false;
  int _radioSelected = 2;
  String? _radioVal;
  File? croppedFile;
  bool isPersonalInfoSave = false;
  bool isAddressSave = false;
  bool isDOBSave = false;

  bool isEducationSave = false;
  bool isWorkExperienceSave = false;
  bool isSkillsSave = false;

  bool isEducationAdd = false;
  bool isWorkExperienceAdd = false;
  bool isSkillsAdd = false;

  bool gotUserData = false;

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  UserDataModel? userDataModel;

  TextEditingController personalInfoSaveController = TextEditingController();
  TextEditingController firstNameEdtController = TextEditingController();
  TextEditingController lastNameEdtController = TextEditingController();
  TextEditingController cityEdtController = TextEditingController();
  TextEditingController stateEdtController = TextEditingController();
  TextEditingController addressEdtController = TextEditingController();
  TextEditingController countryEdtController = TextEditingController();
  TextEditingController dobEdtController = TextEditingController();

  //Education TextEditControllers
  var educationIndex;
  TextEditingController levelOfEducationEdtController = TextEditingController();
  TextEditingController fieldOfStudyEdtController = TextEditingController();
  TextEditingController schoolEdtController = TextEditingController();
  TextEditingController educationStartDateEdtController =
      TextEditingController();
  TextEditingController educationEndDateEdtController = TextEditingController();

  //WorkExperience TextEditControllers
  var workExperienceIndex;
  TextEditingController workExperienceCompanyEdtController =
      TextEditingController();
  TextEditingController workExperiencePositionEdtController =
      TextEditingController();
  TextEditingController workExperienceStartDateEdtController =
      TextEditingController();
  TextEditingController workExperienceEndDateEdtController =
      TextEditingController();
  TextEditingController workExperienceDescriptionEdtController =
      TextEditingController();

  //Skills TextEditControllers
  var skillExperienceIndex;
  TextEditingController skillsEdtController = TextEditingController();
  TextEditingController skillYearsEdtController = TextEditingController();

  var dobSelectedDate = DateTime.now();

  var workStartSelectedDate = DateTime.now();
  var workEndSelectedDate = DateTime.now();
  var educationStartSelectedDate = DateTime.now();
  var educationEndSelectedDate = DateTime.now();

  var profileUrl = "";

  UserPreviousProfileModel? userPreviousProfileModel;
  GetUserInfoModel? getUserInfoModel;

  List<Educations> educations = [];
  List<WorkExperiences> workExperience = [];
  List<UserSkills> userSkills = [];

  var base64Image;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final UpdateUserProfileController _updateUserProfileController =
      Get.isRegistered<UpdateUserProfileController>()
          ? Get.find<UpdateUserProfileController>()
          : Get.put(UpdateUserProfileController());

  Future<void> _selectDate(BuildContext context, String from) async {
    final DateTime? picked = await showDatePicker(
        context: context,
        initialDate: dobSelectedDate,
        firstDate: DateTime(1995, 8),
        lastDate: DateTime(2101));
    var pickedDate = simplyFormat(
        time: DateTime.parse(picked.toString()),
        dateOnly: true,
        from: "update");
    if (picked != null)
      setState(() {
        skillsNewIndex = 0;
        print(picked);
        if (from == "workStart") {
          workStartSelectedDate = picked;
          workExperienceStartDateEdtController.text = pickedDate;
          if (workExperienceIndex != null && workExperience.isNotEmpty) {
            workExperience[workExperienceIndex].workDateStart =
                simplyFormat(time: picked, dateOnly: false);
          }
        } else if (from == "workEnd") {
          workEndSelectedDate = picked;
          workExperienceEndDateEdtController.text = pickedDate;
          if (workExperienceIndex != null && workExperience.isNotEmpty) {
            workExperience[workExperienceIndex].workDateEnd =
                simplyFormat(time: picked, dateOnly: false);
          }
        } else if (from == "eduStart") {
          educationStartSelectedDate = picked;
          educationStartDateEdtController.text = pickedDate;
          if (educationIndex != null && educations.isNotEmpty) {
            educations[educationIndex].timePeriodStar =
                simplyFormat(time: picked, dateOnly: false);
          }
        } else if (from == "eduEnd") {
          educationEndSelectedDate = picked;
          educationEndDateEdtController.text = pickedDate;
          if (educationIndex != null && educations.isNotEmpty) {
            educations[educationIndex].timePeriodEnd =
                simplyFormat(time: picked, dateOnly: false);
          }
        } else if (from == "dob") {
          dobSelectedDate = picked;
          dobEdtController.text = pickedDate;
        }
      });
  }

  var skillsNewIndex = 0;
  var calledGetUserProfiles = false;

  @override
  void initState() {
    SchedulerBinding.instance?.addPostFrameCallback((_) => {});
    WidgetsBinding.instance?.addObserver(this);
    super.initState();
    getUserInfo();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    WidgetsBinding.instance?.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.paused) {
      // went to Background
      print("Returned to the origin...");
    }
    if (state == AppLifecycleState.resumed) {
      // came back to Foreground
      print("Resumed....");
    }
  }

  @override
  Widget build(BuildContext context) {
    skillsNewIndex = 0;
    if (!calledGetUserProfiles) {
      getPreviousUserProfiles(context);
    }
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: InkWell(
            onTap: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => HomeBasePage(
                      selectedIndex: 1,
                    ),
                  ));
            },
            child: Icon(Icons.arrow_back)),
        title: Text(
          'Personal data',
          style: GoogleFonts.roboto(
            color: Colors.black,
          ),
        ),
        centerTitle: true,
      ),
      body: gotUserData
          ? WillPopScope(
              onWillPop: () async {
                Navigator.of(context).popUntil((route) => route.isFirst);
                return false;
              },
              child: Container(
                width: double.infinity,
                margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      InkWell(
                          onTap: () {
                            ChooseFileBottomSheet().showUploadImageActionSheet(
                                context, (value) async {
                              Navigator.of(context).push(new MaterialPageRoute(
                                  builder: (context) =>
                                      CropProfileImage(profileImage: value)));
                            });
                          },
                          child: Center(
                            child: Container(
                              height: 100,
                              width: 100,
                              child: Stack(
                                children: [
                                  ClipOval(
                                    child: userPreviousProfileModel != null &&
                                            userPreviousProfileModel!
                                                    .userProfileData !=
                                                null
                                        ? Image.network(
                                            userPreviousProfileModel!
                                                        .userProfileData
                                                        .where((element) =>
                                                            element.isNow == 1)
                                                        .length ==
                                                    1
                                                ? userPreviousProfileModel!
                                                    .userProfileData
                                                    .where((element) =>
                                                        element.isNow == 1)
                                                    .toList()[0]
                                                    .logoUrl
                                                : userPreviousProfileModel!
                                                    .userProfileData[
                                                        userPreviousProfileModel!
                                                                .userProfileData
                                                                .length -
                                                            1]
                                                    .logoUrl,
                                            height: 100,
                                            width: 100,
                                            fit: BoxFit.cover,
                                          )
                                        : Image.asset(
                                            AppImages.upload_image,
                                            height: 100,
                                            width: 100,
                                          ),
                                  ),
                                  Center(
                                    child: Image(
                                      image: AssetImage(AppImages.ADD),
                                      height: 60,
                                      width: 60,
                                      fit: BoxFit.contain,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )),
                      SizedBox(
                        height: 8,
                      ),
                      Text(
                        'Upload avatar',
                        style: GoogleFonts.roboto(
                          color: Colors.black,
                        ),
                      ),
                      SizedBox(
                        height: 33,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.UPLOAD_HISTORY,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Upload history',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w400, fontSize: 18),
                              ),
                            ),
                            Spacer(),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                      text: userPreviousProfileModel
                                          ?.data.length
                                          .toString(),
                                      style: GoogleFonts.roboto(
                                          fontSize: 22,
                                          color: AppColors.BUTTON_COLOR,
                                          fontWeight: FontWeight.w400)),
                                  TextSpan(
                                      text: " Pic",
                                      style: GoogleFonts.roboto(
                                          fontSize: 14,
                                          color: Colors.black,
                                          fontWeight: FontWeight.w400))
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.topLeft,
                        height: 140,
                        child: userPreviousProfileModel?.data != null &&
                                userPreviousProfileModel?.data.length != 0
                            ? ListView.builder(
                                itemCount:
                                    userPreviousProfileModel?.data.length,
                                shrinkWrap: true,
                                scrollDirection: Axis.horizontal,
                                itemBuilder: (BuildContext context, int index) {
                                  return Container(
                                    width: 100,
                                    height: 185,
                                    margin: EdgeInsets.only(right: 10),
                                    decoration: BoxDecoration(
                                        border: userPreviousProfileModel!
                                                    .userProfileData[index]
                                                    .isNow ==
                                                1
                                            ? Border.all(
                                                color: Colors.blueAccent,
                                                width: 2)
                                            : userPreviousProfileModel!
                                                        .userProfileData
                                                        .where((element) =>
                                                            element.isNow == 1)
                                                        .length ==
                                                    0
                                                ? index ==
                                                        userPreviousProfileModel!
                                                                .userProfileData
                                                                .length -
                                                            1
                                                    ? Border.all(
                                                        color:
                                                            Colors.blueAccent,
                                                        width: 2)
                                                    : Border()
                                                : Border()),
                                    child: Stack(
                                      children: [
                                        InkWell(
                                          onTap: () {
                                            // File imageFile = await urlToFile(userPreviousProfileModel!.userProfileData[index].logoUrl);
                                            Navigator.of(context).push(
                                                new MaterialPageRoute(
                                                    builder:
                                                        (context) =>
                                                            CropProfileImage(
                                                              logoUrl: userPreviousProfileModel!
                                                                  .userProfileData[
                                                                      index]
                                                                  .bigLogoUrl,
                                                              logoId: userPreviousProfileModel!
                                                                  .userProfileData[
                                                                      index]
                                                                  .logoId
                                                                  .toString(),
                                                            )));
                                          },
                                          child: Image.network(
                                            userPreviousProfileModel!
                                                .userProfileData[index]
                                                .bigLogoUrl,
                                            width: 100,
                                            height: 185,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                        Positioned(
                                          right: 0,
                                          top: 0,
                                          child: InkWell(
                                            onTap: () {
                                              deletePreviousProfile(
                                                  userPreviousProfileModel!
                                                      .userProfileData[index]
                                                      .logoId,
                                                  index,
                                                  context);
                                            },
                                            child: Image(
                                              image: AssetImage(
                                                  AppImages.DELETE_IMAGE),
                                              height: 20,
                                              width: 20,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                })
                            : Container(),
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      FormInputWithHint(
                        textEditingController: firstNameEdtController,
                        label: 'First name',
                        onChanged: () {},
                        focusNode: FocusNode(),
                        hintText: 'Please enter your name',
                        isLabelImage: true,
                        labelImage: AppImages.USER_PROFILE,
                      ),
                      SizedBox(
                        height: 14,
                      ),
                      FormInputWithHint(
                        textEditingController: lastNameEdtController,
                        label: 'Last name',
                        onChanged: () {},
                        focusNode: FocusNode(),
                        hintText: 'Please enter your name',
                        isLabelImage: true,
                        labelImage: AppImages.USER_PROFILE,
                      ),
                      SizedBox(
                        height: 14,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.SEX,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Sex',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                Radio(
                                  value: 1,
                                  groupValue: _radioSelected,
                                  activeColor: Colors.blue,
                                  onChanged: (value) {
                                    setState(() {
                                      skillsNewIndex = 0;
                                      _radioSelected = value as int;
                                      _radioVal = 'male';
                                    });
                                  },
                                ),
                                Image(
                                  image: AssetImage(AppImages.male),
                                  width: 11,
                                  height: 20,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text(
                                  'Male',
                                  style: GoogleFonts.roboto(
                                      fontWeight: FontWeight.w400,
                                      fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Row(
                              children: [
                                Radio(
                                  value: 2,
                                  groupValue: _radioSelected,
                                  activeColor: Colors.blue,
                                  onChanged: (value) {
                                    setState(() {
                                      skillsNewIndex = 0;
                                      _radioSelected = value as int;
                                      _radioVal = 'female';
                                    });
                                  },
                                ),
                                Image(
                                  image: AssetImage(AppImages.female),
                                  width: 11,
                                  height: 20,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text(
                                  'Female',
                                  style: GoogleFonts.roboto(
                                      fontWeight: FontWeight.w400,
                                      fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.PERSONAL_INFORMATION,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Personal Information',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      isPersonalInfoSave
                          ? Container(
                              height: 190,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.BUTTON_COLOR_WITH_OPACITY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              child: Column(
                                children: [
                                  Expanded(
                                      child: TextFormField(
                                    maxLines: 5,
                                    maxLength: 220,
                                    controller: personalInfoSaveController,
                                    decoration: InputDecoration(
                                      contentPadding: EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 5),
                                      hintText:
                                          'Please enter your Introduction',
                                      hintStyle: TextStyle(
                                          color: Colors.grey.shade700,
                                          fontSize: 14),
                                      border: InputBorder.none,
                                    ),
                                  )),
                                  SizedBox(
                                    height: 5,
                                  ),
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: Colors.white,
                                            borderColor: AppColors.BUTTON_COLOR,
                                            text: 'Cancel',
                                            textColor: AppColors.BUTTON_COLOR,
                                            onPressed: (value) {
                                              isPersonalInfoSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            buttonRadius: 15,
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: AppColors.BUTTON_COLOR,
                                            textColor: Colors.white,
                                            text: 'Save',
                                            buttonRadius: 15,
                                            onPressed: (value) {
                                              isPersonalInfoSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 10,
                                  ),
                                ],
                              ),
                            )
                          : GestureDetector(
                              onTap: () {
                                isPersonalInfoSave = true;
                                skillsNewIndex = 0;
                                setState(() {});
                              },
                              child: Container(
                                width: double.infinity,
                                padding: EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.FORM_GREY,
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                child: Text(
                                  personalInfoSaveController.text,
                                  style:
                                      GoogleFonts.roboto(color: Colors.black),
                                ),
                              ),
                            ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.ADDRESS,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Address',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      isAddressSave
                          ? Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.BUTTON_COLOR_WITH_OPACITY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 20),
                              child: Column(
                                children: [
                                  FormInputWithHint(
                                      textEditingController:
                                          countryEdtController,
                                      label: 'Country',
                                      onChanged: () {},
                                      labelColor: Colors.grey,
                                      focusNode: FocusNode(),
                                      //borderColor: AppColors.BUTTON_COLOR,

                                      labelFontSize: 14,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: FormInputWithHint(
                                            textEditingController:
                                                stateEdtController,
                                            label: 'State / Province',
                                            borderColor: AppColors.BUTTON_COLOR,
                                            onChanged: () {},
                                            labelColor: Colors.grey,
                                            labelFontSize: 14,
                                            labelFontWeight: FontWeight.w400,
                                            focusNode: FocusNode(),
                                            hintText: ''),
                                      ),
                                      SizedBox(
                                        width: 15,
                                      ),
                                      Expanded(
                                        child: FormInputWithHint(
                                            textEditingController:
                                                cityEdtController,
                                            label: 'City',
                                            onChanged: () {},
                                            borderColor: AppColors.BUTTON_COLOR,
                                            labelColor: Colors.grey,
                                            labelFontSize: 14,
                                            labelFontWeight: FontWeight.w400,
                                            focusNode: FocusNode(),
                                            hintText: ''),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          addressEdtController,
                                      label: 'Detailed address',
                                      onChanged: () {},
                                      labelColor: Colors.grey,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      labelFontSize: 14,
                                      suffixIcon: Icon(
                                        Icons.location_on_outlined,
                                        color: Colors.black,
                                      ),
                                      labelFontWeight: FontWeight.w400,
                                      focusNode: FocusNode(),
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: Colors.white,
                                            borderColor: AppColors.BUTTON_COLOR,
                                            text: 'Cancel',
                                            textColor: AppColors.BUTTON_COLOR,
                                            onPressed: (value) {
                                              isAddressSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            buttonRadius: 15,
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: AppColors.BUTTON_COLOR,
                                            textColor: Colors.white,
                                            text: 'Save',
                                            buttonRadius: 15,
                                            onPressed: (value) {
                                              isAddressSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            )
                          : GestureDetector(
                              onTap: () {
                                isAddressSave = true;
                                skillsNewIndex = 0;
                                setState(() {});
                              },
                              child: Container(
                                height: 200,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: AppColors.FORM_GREY,
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                padding: EdgeInsets.symmetric(
                                    horizontal: 20, vertical: 10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Country',
                                      style: GoogleFonts.roboto(
                                        textStyle: TextStyle(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 14,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      height: 6,
                                    ),
                                    Container(
                                      height: 50,
                                      width: double.infinity,
                                      padding:
                                          EdgeInsets.only(left: 18, right: 18),
                                      decoration: BoxDecoration(
                                        color: AppColors.WHITE,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                      child: Row(
                                        children: [
                                          Visibility(
                                            visible: false,
                                            child: Image(
                                              height: 20,
                                              width: 40,
                                              image: AssetImage(
                                                AppImages.CHINA_FLAG,
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            child: Text(
                                              '${countryEdtController.text} > ${stateEdtController.text} > ${cityEdtController.text}',
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.roboto(
                                                  color: Colors.black),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    SizedBox(
                                      height: 15,
                                    ),
                                    Text(
                                      'Detailed address',
                                      style: GoogleFonts.roboto(
                                        textStyle: TextStyle(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 14,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ),
                                    SizedBox(
                                      height: 6,
                                    ),
                                    Container(
                                      height: 50,
                                      width: double.infinity,
                                      padding:
                                          EdgeInsets.only(left: 18, right: 18),
                                      decoration: BoxDecoration(
                                        color: AppColors.WHITE,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                      child: Align(
                                        alignment: Alignment.centerLeft,
                                        child: Text(
                                          addressEdtController.text,
                                          style: GoogleFonts.roboto(
                                              color: Colors.black),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.BIRTHDAY,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Date of birth',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 8,
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            isDOBSave = true;
                            _selectDate(context, "dob");
                            skillsNewIndex = 0;
                          });
                        },
                        child: Container(
                          height: 50,
                          width: double.infinity,
                          padding: EdgeInsets.only(left: 18, right: 18),
                          decoration: BoxDecoration(
                            color: AppColors.FORM_GREY,
                            // color: isDOBSave
                            //     ? AppColors.BUTTON_COLOR_WITH_OPACITY
                            //     : AppColors.FORM_GREY,
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                dobEdtController.text == ""
                                    ? "MM /Day / Year"
                                    : dobEdtController.text,
                                style: GoogleFonts.roboto(color: Colors.black),
                              ),
                              Image(
                                height: 20,
                                width: 20,
                                image: AssetImage(AppImages.CALENDAR),
                              )
                            ],
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.EDUCATION,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Education',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      isEducationSave
                          ? Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.BUTTON_COLOR_WITH_OPACITY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  setLevelOfEducationCustom
                                      ? FormInputWithHint(
                                          textEditingController:
                                              levelOfEducationEdtController,
                                          label: 'Level of Education',
                                          onChanged: () {},
                                          labelColor: Colors.grey,
                                          borderColor: AppColors.BUTTON_COLOR,
                                          focusNode: FocusNode(),
                                          labelFontSize: 14,
                                          labelFontWeight: FontWeight.w400,
                                          hintText: '')
                                      : Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            Padding(
                                              padding:
                                                  EdgeInsets.only(bottom: 5.0),
                                              child: Text(
                                                "Level of Education",
                                                style: GoogleFonts.roboto(
                                                    color: Colors.grey,
                                                    fontSize: 14),
                                              ),
                                            ),
                                            Container(
                                              height: 45,
                                              width: MediaQuery.of(context)
                                                  .size
                                                  .width,
                                              padding: const EdgeInsets.only(
                                                  top: 12.0,
                                                  bottom: 12.0,
                                                  left: 10),
                                              decoration: BoxDecoration(
                                                  color: AppColors.FORM_GREY,
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                  border: Border.all(
                                                      color: AppColors
                                                          .BUTTON_COLOR)),
                                              child: Padding(
                                                padding:
                                                    EdgeInsets.only(right: 8.0),
                                                child:
                                                    DropdownButtonHideUnderline(
                                                  child: DropdownButton<String>(
                                                    hint: Text(
                                                        levelOfEducationEdtController
                                                            .text,
                                                        style:
                                                            GoogleFonts.roboto(
                                                                color: Colors
                                                                    .black,
                                                                fontSize: 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400)),
                                                    items: <String>[
                                                      "None",
                                                      "Bachelor's",
                                                      "Doctorate",
                                                      "Master's",
                                                      "Custom"
                                                    ].map((String value) {
                                                      return DropdownMenuItem<
                                                          String>(
                                                        value: value,
                                                        child: Text(
                                                          value,
                                                          style: GoogleFonts
                                                              .roboto(
                                                                  color: Colors
                                                                      .black,
                                                                  fontSize: 14,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w400),
                                                        ),
                                                      );
                                                    }).toList(),
                                                    onChanged: (value) {
                                                      setState(() {
                                                        skillsNewIndex = 0;
                                                        if (value == "Custom") {
                                                          levelOfEducationEdtController
                                                              .text = "";
                                                          setLevelOfEducationCustom =
                                                              true;
                                                        } else {
                                                          setLevelOfEducationCustom =
                                                              false;
                                                          levelOfEducationEdtController
                                                                  .text =
                                                              value.toString();
                                                        }
                                                      });
                                                    },
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          fieldOfStudyEdtController,
                                      label: 'Field of study',
                                      onChanged: () {},
                                      labelColor: Colors.grey,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      focusNode: FocusNode(),
                                      labelFontSize: 14,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          schoolEdtController,
                                      label: 'School',
                                      onChanged: () {},
                                      labelColor: Colors.grey,
                                      focusNode: FocusNode(),
                                      borderColor: AppColors.BUTTON_COLOR,
                                      labelFontSize: 14,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            _selectDate(context, "eduStart");
                                          },
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "Time Period",
                                                style: GoogleFonts.roboto(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w400,
                                                    color: Colors.black),
                                              ),
                                              SizedBox(
                                                height: 5,
                                              ),
                                              Container(
                                                padding: const EdgeInsets.only(
                                                    top: 12.0,
                                                    bottom: 12.0,
                                                    left: 10),
                                                decoration: BoxDecoration(
                                                    color: AppColors.FORM_GREY,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            10),
                                                    border: Border.all(
                                                        color: AppColors
                                                            .BUTTON_COLOR)),
                                                child: Row(
                                                  children: [
                                                    Text(
                                                      educationStartDateEdtController
                                                                  .text ==
                                                              ""
                                                          ? "YYYY-MM-DD"
                                                          : educationStartDateEdtController
                                                              .text,
                                                      style: GoogleFonts.roboto(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w400),
                                                    ),
                                                    Spacer(),
                                                    Image(
                                                      height: 20,
                                                      width: 20,
                                                      image: AssetImage(
                                                          AppImages.CALENDAR),
                                                      color: AppColors
                                                          .BUTTON_COLOR,
                                                    ),
                                                    SizedBox(
                                                      width: 10,
                                                    )
                                                  ],
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        width: 15,
                                      ),
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            _selectDate(context, "eduEnd");
                                          },
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "",
                                                style: GoogleFonts.roboto(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w400,
                                                    color: Colors.black),
                                              ),
                                              SizedBox(
                                                height: 5,
                                              ),
                                              Container(
                                                padding: const EdgeInsets.only(
                                                    top: 12.0,
                                                    bottom: 12.0,
                                                    left: 10),
                                                decoration: BoxDecoration(
                                                    color: AppColors.FORM_GREY,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            10),
                                                    border: Border.all(
                                                        color: AppColors
                                                            .BUTTON_COLOR)),
                                                child: Row(
                                                  children: [
                                                    Text(
                                                      educationEndDateEdtController
                                                                  .text ==
                                                              ""
                                                          ? "YYYY-MM-DD"
                                                          : educationEndDateEdtController
                                                              .text,
                                                      style: GoogleFonts.roboto(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w400),
                                                    ),
                                                    Spacer(),
                                                    Image(
                                                      height: 20,
                                                      width: 20,
                                                      image: AssetImage(
                                                          AppImages.CALENDAR),
                                                      color: AppColors
                                                          .BUTTON_COLOR,
                                                    ),
                                                    SizedBox(
                                                      width: 10,
                                                    )
                                                  ],
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: Colors.white,
                                            borderColor: AppColors.BUTTON_COLOR,
                                            text: 'Cancel',
                                            textColor: AppColors.BUTTON_COLOR,
                                            onPressed: (value) {
                                              setLevelOfEducationCustom = false;
                                              isEducationSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            buttonRadius: 15,
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: AppColors.BUTTON_COLOR,
                                            textColor: Colors.white,
                                            text: 'Save',
                                            buttonRadius: 15,
                                            onPressed: (value) {
                                              setEducationExperience();
                                            },
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            )
                          : Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.FORM_GREY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.only(
                                  left: 20, right: 20, top: 10, bottom: 20),
                              child: Column(
                                children: [
                                  ListView.builder(
                                      physics: NeverScrollableScrollPhysics(),
                                      shrinkWrap: true,
                                      scrollDirection: Axis.vertical,
                                      itemCount: educations.length,
                                      itemBuilder: (context, index) {
                                        return GestureDetector(
                                          onTap: () {
                                            isEducationSave = true;
                                            educationIndex = index;
                                            levelOfEducationEdtController.text =
                                                educations[index]
                                                    .levelOfEducation
                                                    .toString();
                                            fieldOfStudyEdtController.text =
                                                educations[index]
                                                    .fieldOfStudy
                                                    .toString();
                                            schoolEdtController.text =
                                                educations[index]
                                                    .school
                                                    .toString();
                                            educationStartDateEdtController
                                                    .text =
                                                simplyFormat(
                                                    time: DateTime.parse(
                                                        educations[index]
                                                            .timePeriodStar
                                                            .toString()),
                                                    dateOnly: true,
                                                    from: "update");
                                            educationEndDateEdtController.text =
                                                simplyFormat(
                                                    time: DateTime.parse(
                                                        educations[index]
                                                            .timePeriodEnd
                                                            .toString()),
                                                    dateOnly: true,
                                                    from: "update");
                                            skillsNewIndex = 0;
                                            setState(() {});
                                          },
                                          child: Container(
                                            margin: EdgeInsets.symmetric(
                                                vertical: 10),
                                            child: Column(
                                              children: [
                                                Container(
                                                  width: double.infinity,
                                                  decoration: BoxDecoration(
                                                    color: Colors.white,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            15),
                                                  ),
                                                  padding: EdgeInsets.symmetric(
                                                      horizontal: 20,
                                                      vertical: 20),
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Row(
                                                        children: [
                                                          Text(
                                                            'Level of Education',
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                fontSize: 14,
                                                                color:
                                                                    Colors.grey,
                                                              ),
                                                            ),
                                                          ),
                                                          Spacer(),
                                                          InkWell(
                                                            onTap: () {
                                                              setState(() {
                                                                skillsNewIndex =
                                                                    0;

                                                                educations
                                                                    .removeAt(
                                                                        index);
                                                              });
                                                            },
                                                            child: SvgPicture
                                                                .asset(
                                                              AppImages
                                                                  .DELETE_RECYCLE,
                                                              height: 15,
                                                              width: 15,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                      Text(
                                                        educations[index]
                                                            .levelOfEducation
                                                            .toString(),
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.black,
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(
                                                        height: 12,
                                                      ),
                                                      Text(
                                                        'Field of study',
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.grey,
                                                          ),
                                                        ),
                                                      ),
                                                      Text(
                                                        educations[index]
                                                            .fieldOfStudy
                                                            .toString(),
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.black,
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(
                                                        height: 12,
                                                      ),
                                                      Text(
                                                        'School',
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.grey,
                                                          ),
                                                        ),
                                                      ),
                                                      Text(
                                                        educations[index]
                                                            .school
                                                            .toString(),
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.black,
                                                          ),
                                                        ),
                                                      ),
                                                      SizedBox(
                                                        height: 12,
                                                      ),
                                                      Text(
                                                        'Time period',
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.grey,
                                                          ),
                                                        ),
                                                      ),
                                                      Text(
                                                        educations[index]
                                                                    .timePeriodStar !=
                                                                null
                                                            ? "${simplyFormat(time: DateTime.parse(educations[index].timePeriodStar.toString()), dateOnly: true)} - ${simplyFormat(time: DateTime.parse(educations[index].timePeriodEnd.toString()), dateOnly: true)}"
                                                            : "",
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle: TextStyle(
                                                            fontWeight:
                                                                FontWeight.w400,
                                                            fontSize: 14,
                                                            color: Colors.black,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      }),
                                  SizedBox(
                                    height: 10,
                                  ),
                                  InkWell(
                                    onTap: () {
                                      setState(() {
                                        skillsNewIndex = 0;

                                        isEducationAdd = true;
                                        isEducationSave = true;
                                        levelOfEducationEdtController.text =
                                            "None";
                                        fieldOfStudyEdtController.text = "";
                                        schoolEdtController.text = "";
                                        educationStartDateEdtController.text =
                                            "";
                                        educationEndDateEdtController.text = "";
                                      });
                                    },
                                    child: Container(
                                      height: 44,
                                      width: double.infinity,
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Image(
                                            image: AssetImage(
                                              AppImages.CIRCLE_ADD,
                                            ),
                                            height: 20,
                                            width: 20,
                                          ),
                                          SizedBox(
                                            width: 20,
                                          ),
                                          Text(
                                            'Add',
                                            style: GoogleFonts.roboto(
                                              textStyle: TextStyle(
                                                fontWeight: FontWeight.w500,
                                                color: AppColors.BUTTON_COLOR,
                                                fontSize: 16,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.WORK,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Work Experience',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      isWorkExperienceSave
                          ? Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.BUTTON_COLOR_WITH_OPACITY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  FormInputWithHint(
                                      textEditingController:
                                          workExperienceCompanyEdtController,
                                      label: 'Company',
                                      onChanged: () {},
                                      labelColor: Colors.black,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      focusNode: FocusNode(),
                                      labelFontSize: 14,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 18,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          workExperiencePositionEdtController,
                                      label: 'Position',
                                      onChanged: () {},
                                      labelColor: Colors.black,
                                      labelFontSize: 14,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      labelFontWeight: FontWeight.w400,
                                      focusNode: FocusNode(),
                                      hintText: ''),
                                  SizedBox(
                                    height: 18,
                                  ),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            _selectDate(context, "workStart");
                                          },
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "Start Date",
                                                style: GoogleFonts.roboto(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w400,
                                                    color: Colors.black),
                                              ),
                                              SizedBox(
                                                height: 5,
                                              ),
                                              Container(
                                                padding: const EdgeInsets.only(
                                                    top: 12.0,
                                                    bottom: 12.0,
                                                    left: 10),
                                                decoration: BoxDecoration(
                                                    color: AppColors.FORM_GREY,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            10),
                                                    border: Border.all(
                                                        color: AppColors
                                                            .BUTTON_COLOR)),
                                                child: Row(
                                                  children: [
                                                    Text(
                                                      workExperienceStartDateEdtController
                                                                  .text ==
                                                              ""
                                                          ? "YYYY-MM-DD"
                                                          : workExperienceStartDateEdtController
                                                              .text,
                                                      style: GoogleFonts.roboto(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w400),
                                                    ),
                                                    Spacer(),
                                                    Image(
                                                      height: 20,
                                                      width: 20,
                                                      image: AssetImage(
                                                          AppImages.CALENDAR),
                                                      color: AppColors
                                                          .BUTTON_COLOR,
                                                    ),
                                                    SizedBox(
                                                      width: 10,
                                                    )
                                                  ],
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        width: 15,
                                      ),
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            _selectDate(context, "workEnd");
                                          },
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "End Date",
                                                style: GoogleFonts.roboto(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w400,
                                                    color: Colors.black),
                                              ),
                                              SizedBox(
                                                height: 5,
                                              ),
                                              Container(
                                                padding: const EdgeInsets.only(
                                                    top: 12.0,
                                                    bottom: 12.0,
                                                    left: 10),
                                                decoration: BoxDecoration(
                                                    color: AppColors.FORM_GREY,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            10),
                                                    border: Border.all(
                                                        color: AppColors
                                                            .BUTTON_COLOR)),
                                                child: Row(
                                                  children: [
                                                    Text(
                                                      workExperienceEndDateEdtController
                                                                  .text ==
                                                              ""
                                                          ? "YYYY-MM-DD"
                                                          : workExperienceEndDateEdtController
                                                              .text,
                                                      style: GoogleFonts.roboto(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w400),
                                                    ),
                                                    Spacer(),
                                                    Image(
                                                      height: 20,
                                                      width: 20,
                                                      image: AssetImage(
                                                          AppImages.CALENDAR),
                                                      color: AppColors
                                                          .BUTTON_COLOR,
                                                    ),
                                                    SizedBox(
                                                      width: 10,
                                                    )
                                                  ],
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          workExperienceDescriptionEdtController,
                                      label: 'Work Description',
                                      labelColor: Colors.black,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      focusNode: FocusNode(),
                                      labelFontSize: 14,
                                      inputHeight: 160,
                                      textFieldHeight: 12,
                                      horizontalPadding: 10,
                                      maxLine: 10,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: Colors.white,
                                            borderColor: AppColors.BUTTON_COLOR,
                                            text: 'Cancel',
                                            textColor: AppColors.BUTTON_COLOR,
                                            onPressed: (value) {
                                              isWorkExperienceSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            buttonRadius: 15,
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: AppColors.BUTTON_COLOR,
                                            textColor: Colors.white,
                                            text: 'Save',
                                            buttonRadius: 15,
                                            onPressed: (value) {
                                              setWorkExperience();
                                            },
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            )
                          : Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.FORM_GREY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 20),
                              child: Column(
                                children: [
                                  ListView.builder(
                                      physics: NeverScrollableScrollPhysics(),
                                      shrinkWrap: true,
                                      itemCount: workExperience.length,
                                      itemBuilder: (context, index) {
                                        return GestureDetector(
                                          onTap: () {
                                            isWorkExperienceSave = true;
                                            workExperienceCompanyEdtController
                                                    .text =
                                                workExperience[index]
                                                    .companyName
                                                    .toString();
                                            workExperiencePositionEdtController
                                                    .text =
                                                workExperience[index]
                                                    .position
                                                    .toString();
                                            workExperienceDescriptionEdtController
                                                    .text =
                                                workExperience[index]
                                                    .workDescription
                                                    .toString();
                                            workExperienceStartDateEdtController
                                                    .text =
                                                simplyFormat(
                                                    time: DateTime.parse(
                                                        workExperience[index]
                                                            .workDateStart
                                                            .toString()),
                                                    dateOnly: true,
                                                    from: "update");
                                            workExperienceEndDateEdtController
                                                    .text =
                                                simplyFormat(
                                                    time: DateTime.parse(
                                                        workExperience[index]
                                                            .workDateEnd
                                                            .toString()),
                                                    dateOnly: true,
                                                    from: "update");
                                            workExperienceIndex = index;
                                            skillsNewIndex = 0;
                                            setState(() {});
                                          },
                                          child: Container(
                                            margin: EdgeInsets.symmetric(
                                                vertical: 10),
                                            child: Column(
                                              children: [
                                                Stack(
                                                  children: [
                                                    Container(
                                                      width: double.infinity,
                                                      decoration: BoxDecoration(
                                                        color: Colors.white,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(15),
                                                      ),
                                                      padding:
                                                          EdgeInsets.symmetric(
                                                              horizontal: 20,
                                                              vertical: 20),
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Row(
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .spaceBetween,
                                                            children: [
                                                              Column(
                                                                crossAxisAlignment:
                                                                    CrossAxisAlignment
                                                                        .start,
                                                                children: [
                                                                  Text(
                                                                    'Company',
                                                                    style: GoogleFonts
                                                                        .roboto(
                                                                      textStyle:
                                                                          TextStyle(
                                                                        fontWeight:
                                                                            FontWeight.w400,
                                                                        fontSize:
                                                                            14,
                                                                        color: Colors
                                                                            .grey,
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Text(
                                                                    workExperience[
                                                                            index]
                                                                        .companyName
                                                                        .toString(),
                                                                    style: GoogleFonts
                                                                        .roboto(
                                                                      textStyle:
                                                                          TextStyle(
                                                                        fontWeight:
                                                                            FontWeight.w400,
                                                                        fontSize:
                                                                            14,
                                                                        color: Colors
                                                                            .black,
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ],
                                                              ),
                                                              Padding(
                                                                padding: EdgeInsets
                                                                    .only(
                                                                        right:
                                                                            16.0),
                                                                child: Column(
                                                                  children: [
                                                                    Text(
                                                                      'Date',
                                                                      style: GoogleFonts
                                                                          .roboto(
                                                                        textStyle:
                                                                            TextStyle(
                                                                          fontWeight:
                                                                              FontWeight.w400,
                                                                          fontSize:
                                                                              14,
                                                                          color:
                                                                              Colors.grey,
                                                                        ),
                                                                      ),
                                                                    ),
                                                                    Text(
                                                                      workExperience[index].workDateStart !=
                                                                              ""
                                                                          ? "${simplyFormat(time: DateTime.parse(workExperience[index].workDateStart.toString()), dateOnly: true, from: "company")} - ${simplyFormat(time: DateTime.parse(workExperience[index].workDateEnd.toString()), dateOnly: true, from: "company")}"
                                                                          : "",
                                                                      style: GoogleFonts
                                                                          .roboto(
                                                                        textStyle:
                                                                            TextStyle(
                                                                          fontWeight:
                                                                              FontWeight.w400,
                                                                          fontSize:
                                                                              14,
                                                                          color:
                                                                              Colors.black,
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                          SizedBox(
                                                            height: 12,
                                                          ),
                                                          Text(
                                                            'Position',
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                fontSize: 14,
                                                                color:
                                                                    Colors.grey,
                                                              ),
                                                            ),
                                                          ),
                                                          Text(
                                                            workExperience[
                                                                    index]
                                                                .position
                                                                .toString(),
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                fontSize: 14,
                                                                color: Colors
                                                                    .black,
                                                              ),
                                                            ),
                                                          ),
                                                          SizedBox(
                                                            height: 12,
                                                          ),
                                                          Text(
                                                            'Work Experience',
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                fontSize: 14,
                                                                color:
                                                                    Colors.grey,
                                                              ),
                                                            ),
                                                          ),
                                                          Text(
                                                            workExperience[
                                                                    index]
                                                                .workDescription
                                                                .toString(),
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                                fontSize: 14,
                                                                color: Colors
                                                                    .black,
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    InkWell(
                                                      onTap: () {
                                                        workExperience
                                                            .removeAt(index);
                                                        skillsNewIndex = 0;
                                                        setState(() {});
                                                      },
                                                      child: Padding(
                                                        padding:
                                                            EdgeInsets.only(
                                                                right: 14.0,
                                                                top: 12.0),
                                                        child: Align(
                                                          alignment: Alignment
                                                              .topRight,
                                                          child:
                                                              SvgPicture.asset(
                                                            AppImages
                                                                .DELETE_RECYCLE,
                                                            width: 15,
                                                            height: 15,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      }),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  InkWell(
                                    onTap: () {
                                      workExperienceCompanyEdtController.text =
                                          "";
                                      workExperiencePositionEdtController.text =
                                          "";
                                      workExperienceDescriptionEdtController
                                          .text = "";
                                      workExperienceStartDateEdtController
                                          .text = "";
                                      workExperienceEndDateEdtController.text =
                                          "";
                                      isWorkExperienceAdd = true;
                                      isWorkExperienceSave = true;
                                      skillsNewIndex = 0;
                                      setState(() {});
                                    },
                                    child: Container(
                                      height: 44,
                                      width: double.infinity,
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Image(
                                            image: AssetImage(
                                              AppImages.CIRCLE_ADD,
                                            ),
                                            height: 20,
                                            width: 20,
                                          ),
                                          SizedBox(
                                            width: 20,
                                          ),
                                          Text(
                                            'Add',
                                            style: GoogleFonts.roboto(
                                              textStyle: TextStyle(
                                                fontWeight: FontWeight.w500,
                                                color: AppColors.BUTTON_COLOR,
                                                fontSize: 16,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: [
                            Container(
                              margin: EdgeInsets.only(right: 10),
                              child: Image(
                                image: AssetImage(
                                  AppImages.SKILLS,
                                ),
                                height: 20,
                                width: 20,
                              ),
                            ),
                            Text(
                              'Skills',
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 18),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      isSkillsSave
                          ? Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.BUTTON_COLOR_WITH_OPACITY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Recommendation:',
                                    style: GoogleFonts.roboto(
                                      textStyle: TextStyle(
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.BUTTON_COLOR,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    'include 3-5 of your top skills to help you stand out.:',
                                    style: GoogleFonts.roboto(
                                      textStyle: TextStyle(
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.BLACK,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                  SizedBox(
                                    height: 6,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          skillsEdtController,
                                      label: 'Choose your skills',
                                      onChanged: () {},
                                      labelColor: Colors.black,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      focusNode: FocusNode(),
                                      labelFontSize: 14,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  FormInputWithHint(
                                      textEditingController:
                                          skillYearsEdtController,
                                      label: 'Years of experience',
                                      onChanged: () {},
                                      labelColor: Colors.black,
                                      borderColor: AppColors.BUTTON_COLOR,
                                      focusNode: FocusNode(),
                                      labelFontSize: 14,
                                      labelFontWeight: FontWeight.w400,
                                      hintText: ''),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: Colors.white,
                                            borderColor: AppColors.BUTTON_COLOR,
                                            text: 'Cancel',
                                            textColor: AppColors.BUTTON_COLOR,
                                            onPressed: (value) {
                                              isSkillsSave = false;
                                              skillsNewIndex = 0;
                                              setState(() {});
                                            },
                                            buttonRadius: 15,
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Expanded(
                                        child: RoundedEdgeButton(
                                            height: 44,
                                            color: AppColors.BUTTON_COLOR,
                                            textColor: Colors.white,
                                            text: 'Save',
                                            buttonRadius: 15,
                                            onPressed: (value) {
                                              setSkillsExperience();
                                            },
                                            context: context),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            )
                          : Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.FORM_GREY,
                                borderRadius: BorderRadius.circular(15),
                              ),
                              padding: EdgeInsets.only(
                                  left: 20, right: 20, bottom: 20, top: 10),
                              child: Column(
                                children: [
                                  ListView.builder(
                                    physics: NeverScrollableScrollPhysics(),
                                    shrinkWrap: true,
                                    scrollDirection: Axis.vertical,
                                    itemCount:
                                        (userSkills.length.toInt() + 1) ~/ 2,
                                    itemBuilder: (context, mainIndex) {
                                      return Container(
                                        margin:
                                            EdgeInsets.symmetric(vertical: 10),
                                        padding: EdgeInsets.all(20),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius:
                                              BorderRadius.circular(15),
                                        ),
                                        child: Column(
                                          children: [
                                            Align(
                                              alignment: Alignment.topRight,
                                              child: InkWell(
                                                onTap: () {
                                                  var clickIndex;
                                                  if (mainIndex > 0) {
                                                    clickIndex =
                                                        (mainIndex + mainIndex);
                                                  } else {
                                                    clickIndex = mainIndex;
                                                  }

                                                  userSkills
                                                      .removeAt(clickIndex);
                                                  skillsNewIndex = 0;
                                                  setState(() {});
                                                },
                                                child: Padding(
                                                  padding: EdgeInsets.only(
                                                      bottom: 8.0),
                                                  child: SvgPicture.asset(
                                                    AppImages.DELETE_RECYCLE,
                                                    height: 14,
                                                    width: 14,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Row(
                                              children: [
                                                Text(
                                                  'SKills name',
                                                  style: GoogleFonts.roboto(
                                                    textStyle: TextStyle(
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      fontSize: 14,
                                                      color: Colors.grey,
                                                    ),
                                                  ),
                                                ),
                                                Spacer(),
                                                Text(
                                                  'Experience',
                                                  style: GoogleFonts.roboto(
                                                    textStyle: TextStyle(
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      fontSize: 14,
                                                      color: Colors.grey,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            SizedBox(
                                              height: 10,
                                            ),
                                            ListView.builder(
                                                physics:
                                                    NeverScrollableScrollPhysics(),
                                                shrinkWrap: true,
                                                scrollDirection: Axis.vertical,
                                                itemCount: 2,
                                                itemBuilder: (context, index) {
                                                  setListValue(mainIndex);
                                                  return skillsNewIndex >
                                                          userSkills.length
                                                      ? Container()
                                                      : InkWell(
                                                          onTap: () {
                                                            var clickIndex;
                                                            if (mainIndex > 0) {
                                                              clickIndex =
                                                                  (mainIndex +
                                                                          mainIndex) +
                                                                      index;
                                                            } else {
                                                              clickIndex =
                                                                  mainIndex +
                                                                      index;
                                                            }
                                                            isSkillsSave = true;
                                                            skillExperienceIndex =
                                                                clickIndex;
                                                            skillsEdtController
                                                                .text = userSkills[
                                                                    clickIndex]
                                                                .chooseSkills
                                                                .toString();
                                                            skillYearsEdtController
                                                                .text = userSkills[
                                                                    clickIndex]
                                                                .skillExperience
                                                                .toString();

                                                            skillsNewIndex = 0;
                                                            setState(() {});
                                                          },
                                                          child: Container(
                                                            padding: EdgeInsets
                                                                .symmetric(
                                                                    vertical:
                                                                        10),
                                                            child: Row(
                                                              children: [
                                                                Text(
                                                                  userSkills[
                                                                          skillsNewIndex -
                                                                              1]
                                                                      .chooseSkills
                                                                      .toString(),
                                                                  style:
                                                                      GoogleFonts
                                                                          .roboto(
                                                                    textStyle:
                                                                        TextStyle(
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w400,
                                                                      fontSize:
                                                                          14,
                                                                      color: Colors
                                                                          .black,
                                                                    ),
                                                                  ),
                                                                ),
                                                                Spacer(),
                                                                Text(
                                                                  userSkills[
                                                                          skillsNewIndex -
                                                                              1]
                                                                      .skillExperience
                                                                      .toString(),
                                                                  style:
                                                                      GoogleFonts
                                                                          .roboto(
                                                                    textStyle:
                                                                        TextStyle(
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w400,
                                                                      fontSize:
                                                                          14,
                                                                      color: Colors
                                                                          .black,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                        );
                                                })
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                                  SizedBox(
                                    height: 30,
                                  ),
                                  InkWell(
                                    onTap: () {
                                      isSkillsAdd = true;
                                      isSkillsSave = true;
                                      skillsEdtController.text = "";
                                      skillYearsEdtController.text = "";
                                      skillsNewIndex = 0;
                                      setState(() {});
                                    },
                                    child: Container(
                                      height: 44,
                                      width: double.infinity,
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Image(
                                            image: AssetImage(
                                              AppImages.CIRCLE_ADD,
                                            ),
                                            height: 20,
                                            width: 20,
                                          ),
                                          SizedBox(
                                            width: 20,
                                          ),
                                          Text(
                                            'Add',
                                            style: GoogleFonts.roboto(
                                              textStyle: TextStyle(
                                                fontWeight: FontWeight.w500,
                                                color: AppColors.BUTTON_COLOR,
                                                fontSize: 16,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                      RoundedEdgeButton(
                          height: AppSizes.BUTTON_HEIGHT,
                          color: AppColors.BUTTON_COLOR,
                          text: 'Save',
                          buttonRadius: AppSizes.BUTTON_RADIUS,
                          textColor: AppColors.WHITE,
                          textFontSize: AppSizes.BUTTON_FONT_SIZE,
                          topMargin: AppSizes.BUTTON_MARGIN,
                          onPressed: (value) {
                            updateUserInfo(context);
                          },
                          context: context),
                      SizedBox(
                        height: 20,
                      ),
                    ],
                  ),
                ),
              ),
            )
          : Center(
              child: Container(
                  height: 96,
                  width: 96,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Image.asset(
                      //'assets/gif_files/otpModel.dataf',
                      'assets/gif_files/loader_transparent.gif',
                      height: 72,
                      width: 68,
                    ),
                  )),
            ),
    );
  }

  // void setUserProfile(BuildContext context) async {
  //   showCircularDialog(context);
  //   userDataModel = await _getSharedPref.getUserData();
  //   try {
  //     var uri = Uri.parse('${Urls.baseUrl}/user/addHeader?lang=en_US');
  //     var request = new http.MultipartRequest("POST", uri);
  //     var stream = new http.ByteStream(croppedFile!.openRead());
  //     stream.cast();
  //     var length = await croppedFile!.length();
  //     request.files.add(http.MultipartFile(
  //       'file',
  //       stream,
  //       length,
  //       filename: basename(croppedFile!.path),
  //       contentType: MediaType('image', 'jpeg'),
  //     ));

  //     Map<String, String> headers = {
  //       "Content-Type": "multipart/form-data",
  //       "Authorization": userDataModel!.authToken!
  //     }; // ignore this headers if there is no authentication

  //     //add headers
  //     request.headers.addAll(headers);

  //     // send
  //     var response = await request.send();

  //     // listen for response
  //     response.stream.transform(utf8.decoder).listen((value) {
  //       UploadUserProfileModel uploadUserProfileModel =
  //           UploadUserProfileModel.fromJson(jsonDecode(value));
  //       Navigator.pop(context);

  //       userDataModel?.profilePicture = uploadUserProfileModel.logoUrl;
  //       _getSharedPref.saveSharedPreference(userDataModel!);

  //       if (uploadUserProfileModel.flag) {
  //         // showSuccess(title: "Success", message: uploadUserProfileModel.message);
  //         profileUrl = uploadUserProfileModel.logoUrl;
  //         // getPreviousUserProfiles();
  //         skillsNewIndex = 0;
  //         setState(() {});
  //       } else {
  //         throw uploadUserProfileModel.message.toString();
  //       }
  //     });
  //   } catch (onError) {
  //     // showError(title: "Error", message: onError.toString());
  //   }
  // }

  void getPreviousUserProfiles(BuildContext context) async {
    userDataModel = await _getSharedPref.getUserData();
    try {
      userPreviousProfileModel = await _updateUserProfileController
          .getUserProfile(userDataModel!.authToken!);
      if (userPreviousProfileModel!.flag!) {
        // showSuccess(
        //     title: "Success", message: userPreviousProfileModel!.message!);

        userPreviousProfileModel!.userProfileData.forEach((element) {
          print(' element.isNow : ${element.isNow}');
          print(' element.logoUrl : ${element.logoUrl}');
          if (element.isNow == 1) {
            profileUrl = element.logoUrl;
            print(' profileUrl : $profileUrl');
            Provider.of<AppDataNotifier>(context, listen: false)
                .updateProfileImage(profileUrl);
          } else {
            // profileUrl = "";
          }
        });
        calledGetUserProfiles = true;
        skillsNewIndex = 0;
        setState(() {});
      } else {
        showError(title: 'Error', message: userPreviousProfileModel!.message!);
        throw userPreviousProfileModel!.message!;
      }
    } catch (error) {
      // showError(title: "Error ", message: error.toString());
    }
  }

  static Circle processIndicator = Circle();
  void deletePreviousProfile(
      int logoID, int index, BuildContext context) async {
    // showCircularDialog(context);
    processIndicator.show(context);
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    final Map<String, dynamic> params;
    params = {"logoId": logoID};
    try {
      var model = await _updateUserProfileController.removeUserProfile(
          userDataModel.authToken!, params);
      // Navigator.of(context).pop();
      if (model.flag!) {
        showSuccess(title: "Success", message: model.message!);
        userPreviousProfileModel!.userProfileData.removeAt(index);
        // getPreviousUserProfiles(context);
        // setUserProfile(context);
        // userPreviousProfileModel!.data.removeAt(index);
        skillsNewIndex = 0;
        processIndicator.hide(context);
        setState(() {});
        // setState(() {});
      } else {
        processIndicator.hide(context);
        showError(title: 'Error', message: model.message!);
        throw model.message!;
      }
    } catch (error) {
      processIndicator.hide(context);
      print(error);
      // showError(title: "Error 1", message: error.toString());
    }
  }

  void getUserInfo() async {
    userDataModel = await _getSharedPref.getUserData();
    UserPref.userPref = await SharedPreferences.getInstance();
    try {
      getUserInfoModel = await _updateUserProfileController
          .getUserInfo(userDataModel!.authToken!);
      if (getUserInfoModel!.flag!) {
        // showSuccess(title: "Success", message: getUserInfoModel!.message!);
        setUserInfo(getUserInfoModel);
        skillsNewIndex = 0;
        setState(() {
          // userDataModel;
          // getUserInfoModel;
          gotUserData = true;
        });
      } else {
        throw getUserInfoModel!.message!;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error 2", message: error.toString());
    }
  }

  void setUserInfo(GetUserInfoModel? getUserInfoModel) async {
    setState(() {
      skillsNewIndex = 0;
      firstNameEdtController.text =
          getUserInfoModel!.data!.userInfo!.firstName!.toString();
      lastNameEdtController.text =
          getUserInfoModel.data!.userInfo!.lastName!.toString();
      personalInfoSaveController.text =
          getUserInfoModel.data!.userInfo!.introduction!.toString();

      _radioSelected = getUserInfoModel.data!.userInfo!.gender == "man" ? 1 : 2;

      stateEdtController.text = getUserInfoModel.data!.userInfo!.state ?? "";
      cityEdtController.text = getUserInfoModel.data!.userInfo!.city ?? "";
      countryEdtController.text =
          getUserInfoModel.data!.userInfo!.country ?? "";
      addressEdtController.text =
          getUserInfoModel.data!.userInfo!.address ?? "";
      dobSelectedDate = DateTime.parse(
          getUserInfoModel.data!.userInfo!.dateOfBirth.toString());

      dobEdtController.text = simplyFormat(
          time: DateTime.parse(
              getUserInfoModel.data!.userInfo!.dateOfBirth.toString()),
          dateOnly: true,
          from: "userEditProfile");

      educations = getUserInfoModel.data?.educations ?? [];
      workExperience = getUserInfoModel.data?.workExperiences ?? [];
      userSkills = getUserInfoModel.data?.userSkills ?? [];
    });
  }

  void updateUserInfo(BuildContext context) async {
    showCircularDialog(context);
    setWorkExperience();
    setEducationExperience();
    setSkillsExperience();

    var lastEndYear = 0;
    var position = "";
    workExperience.forEach((element) {
      var parsedDate = DateTime.parse(element.workDateEnd.toString());
      if (parsedDate.year > lastEndYear) {
        position = element.position.toString();
      }
      lastEndYear = parsedDate.year;
    });
    print("workExperience $educations");

    final Map<String, dynamic> userInfoParams = {
      "userInfo": {
        "id": getUserInfoModel!.data!.userInfo!.id,
        "userId": getUserInfoModel!.data!.userInfo!.userId,
        "firstName": firstNameEdtController.text.toString(),
        "lastName": lastNameEdtController.text.toString(),
        "gender": _radioSelected == 1 ? "man" : "woman",
        "introduction": personalInfoSaveController.text.toString(),
        "country": countryEdtController.text.toString(),
        "state": stateEdtController.text.toString(),
        "city": cityEdtController.text.toString(),
        "address": addressEdtController.text.toString(),
        "dateOfBirth": simplyFormat(
            time: DateTime.parse(dobSelectedDate.toString()), dateOnly: false),
        "position": position
      },
      "educations": educations,
      "workExperiences": workExperience,
      "userSkills": userSkills
    };
    SharedPreferences pref = await SharedPreferences.getInstance();
    pref.setString('birthDate', '$dobSelectedDate');
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _updateUserProfileController.updateUserInfo(
          userDataModel.authToken!, userInfoParams);
      Navigator.pop(context);
      if (model.flag!) {
        showSuccess(title: "Success", message: model.message!);
        Navigator.of(context).pushReplacement(
            new MaterialPageRoute(builder: (context) => PersonalDataSuccess()));
      } else {
        throw model.message!;
      }
    } catch (error) {
      print(error.toString());
      Navigator.pop(context);
      // showError(title: "Error", message: error.toString());
    }
  }

  void setListValue(int index) {
    if (skillsNewIndex != userSkills.length + 1) {
      skillsNewIndex = skillsNewIndex + 1;
    }
  }

  void setEducationExperience() {
    if (educationIndex != null) {}

    if (isEducationAdd) {
      var educationsData = Educations(
          fieldOfStudy: fieldOfStudyEdtController.text.toString(),
          levelOfEducation: levelOfEducationEdtController.text.toString(),
          school: schoolEdtController.text.toString(),
          timePeriodStar:
              simplyFormat(time: educationStartSelectedDate, dateOnly: false),
          timePeriodEnd:
              simplyFormat(time: educationEndSelectedDate, dateOnly: false));
      educations.add(educationsData);
    } else {
      if (educationIndex != null && educations.isNotEmpty) {
        educations[educationIndex].levelOfEducation =
            levelOfEducationEdtController.text.toString();
        educations[educationIndex].fieldOfStudy =
            fieldOfStudyEdtController.text.toString();
        educations[educationIndex].school = schoolEdtController.text.toString();
      }
    }

    isEducationAdd = false;
    isEducationSave = false;
    skillsNewIndex = 0;
    setState(() {});
  }

  void setWorkExperience() {
    if (isWorkExperienceAdd) {
      var workExperienceData = WorkExperiences(
          companyName: workExperienceCompanyEdtController.text.toString(),
          position: workExperiencePositionEdtController.text.toString(),
          workDescription:
              workExperienceDescriptionEdtController.text.toString(),
          workDateStart:
              simplyFormat(time: workStartSelectedDate, dateOnly: false),
          workDateEnd:
              simplyFormat(time: workEndSelectedDate, dateOnly: false));
      workExperience.add(workExperienceData);
    } else {
      if (workExperienceIndex != null && workExperience.isNotEmpty) {
        workExperience[workExperienceIndex].companyName =
            workExperienceCompanyEdtController.text.toString();
        workExperience[workExperienceIndex].position =
            workExperiencePositionEdtController.text.toString();
        workExperience[workExperienceIndex].workDescription =
            workExperienceDescriptionEdtController.text.toString();
      }
    }

    isWorkExperienceAdd = false;
    isWorkExperienceSave = false;
    skillsNewIndex = 0;
    setState(() {});
  }

  void setSkillsExperience() {
    if (isSkillsAdd) {
      var userSkillsData = UserSkills(
        chooseSkills: skillsEdtController.text.toString(),
        skillExperience: skillYearsEdtController.text.toString(),
      );
      userSkills.add(userSkillsData);
    } else {
      if (skillExperienceIndex != null && userSkills.isNotEmpty) {
        userSkills[skillExperienceIndex].chooseSkills =
            skillsEdtController.text.toString();
        userSkills[skillExperienceIndex].skillExperience =
            skillYearsEdtController.text.toString();
      }
    }
    setState(() {
      isSkillsAdd = false;
      isSkillsSave = false;
      skillsNewIndex = 0;
    });
  }

  Future<File> urlToFile(String imageUrl) async {
    var rng = new Random();
    Directory tempDir = await getApplicationDocumentsDirectory();
    String tempPath = tempDir.path;
    File file = new File('$tempPath' + (rng.nextInt(100)).toString() + '.png');
    http.Response response = await http.get(Uri.parse(imageUrl));
    await file.writeAsBytes(response.bodyBytes);
    return file;
  }
}

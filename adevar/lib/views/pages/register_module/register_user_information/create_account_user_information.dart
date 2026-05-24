import 'dart:developer';
import 'dart:io';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';

import 'package:highfedilityadevar/utils/helper.dart';
import 'package:highfedilityadevar/views/bottom_sheets/choose_file/choose_file_bottom_sheet.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../controllers/add_login_device/add_login_device_controller.dart';
import '../../../../controllers/register_user_information/register_user_information_controller.dart';
import '../../../../controllers/user_data/get_shared_pref.dart';
import '../../../../models/registerInfo/register_info_model.dart';
import '../../../../models/user_data/user_model.dart';
import '../../../../utils/baseClass.dart';
import '../../home_base/home_base_page.dart';

class CreateAccountPage extends StatefulWidget {
  @override
  _CreateAccountPageState createState() => _CreateAccountPageState();
}

class _CreateAccountPageState extends State<CreateAccountPage> with BaseClass {
  FocusNode _firstNameFocus = FocusNode();
  FocusNode _lastNameFocus = FocusNode();
  FocusNode _workFocus = FocusNode();
  final AddLoginDeviceController _addLoginDeviceController =
      Get.isRegistered<AddLoginDeviceController>()
          ? Get.find<AddLoginDeviceController>()
          : Get.put(AddLoginDeviceController());
  AndroidDeviceInfo? androidInfo;

  IosDeviceInfo? iosInfo;
  String deviceModel = "";
  String deviceId = "";
  getDeviceInformation() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      androidInfo = await deviceInfo.androidInfo;
      deviceModel = androidInfo!.model!;
      deviceId = androidInfo!.androidId!;
    } else {
      iosInfo = await deviceInfo.iosInfo;
      deviceModel = iosInfo!.name!;

      deviceId = iosInfo!.identifierForVendor!;
    }
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getDeviceInformation();
  }

  bool isMaleSelected = true;
  bool isFemaleSelected = false;
  String _radioValue = 'one';
  String _radioValue2 = 'two';
  int _radioSelected = 1;
  String? _radioVal;
  File? croppedFile;
  final GetSharedPref getSharedPref = Get.put(GetSharedPref());
  String _selectedCountry = "China";
  final RegisterUserInformationController _registerUserInformationController =
      Get.isRegistered<RegisterUserInformationController>()
          ? Get.find<RegisterUserInformationController>()
          : Get.put(RegisterUserInformationController());
  TextEditingController _firstNameController = TextEditingController();
  TextEditingController _lastNameController = TextEditingController();
  TextEditingController _workController = TextEditingController();

  bool _isAllFieldsCompleted = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Container(
        width: double.infinity,
        margin: EdgeInsets.symmetric(horizontal: AppSizes.PAGE_PADDING),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              GestureDetector(
                  onTap: () {
                    _firstNameFocus.unfocus();
                    _lastNameFocus.unfocus();
                    _workFocus.unfocus();
                    //FocusManager.instance.primaryFocus?.unfocus();
                    /*
                    FocusScope.of(context).requestFocus(FocusNode());
                    SystemChannels.textInput.invokeMethod('TextInput.hide');*/
                    ChooseFileBottomSheet().showUploadImageActionSheet(context,
                        (value) async {
                      croppedFile = await ImageCropper().cropImage(
                          sourcePath: value.path,
                          aspectRatioPresets: [
                            CropAspectRatioPreset.square,
                            CropAspectRatioPreset.ratio3x2,
                            CropAspectRatioPreset.original,
                            CropAspectRatioPreset.ratio4x3,
                            CropAspectRatioPreset.ratio16x9
                          ],
                          androidUiSettings: AndroidUiSettings(
                              toolbarTitle: 'Adevar',
                              toolbarColor: AppColors.BUTTON_COLOR,
                              toolbarWidgetColor: Colors.white,
                              initAspectRatio: CropAspectRatioPreset.square,
                              lockAspectRatio: false),
                          iosUiSettings: IOSUiSettings(
                            minimumAspectRatio: 1.0,
                          ));
                      setState(() {});
                    });
                  },
                  child: croppedFile == null
                      ? ClipOval(
                          child: Image(
                            image: AssetImage(AppImages.upload_image),
                            height: 100,
                            width: 100,
                            fit: BoxFit.cover,
                          ),
                        )
                      : ClipOval(
                          child: Image(
                            image: FileImage(croppedFile!),
                            height: 100,
                            width: 100,
                            fit: BoxFit.cover,
                          ),
                        )),
              SizedBox(
                height: 33,
              ),
              FormInputWithHint(
                label: 'First name',
                onChanged: (value) {
                  setState(() {
                    if ((croppedFile == null ||
                        _firstNameController.text.trim().isEmpty ||
                        _lastNameController.text.trim().isEmpty ||
                        _workController.text.trim().isEmpty)) {
                      _isAllFieldsCompleted = false;
                    } else {
                      _isAllFieldsCompleted = true;
                    }
                  });
                },
                focusNode: _firstNameFocus,
                textEditingController: _firstNameController,
                hintText: 'Please enter your name',
              ),
              SizedBox(
                height: 14,
              ),
              FormInputWithHint(
                label: 'Last name',
                onChanged: (value) {
                  setState(() {
                    if ((croppedFile == null ||
                        _firstNameController.text.trim().isEmpty ||
                        _lastNameController.text.trim().isEmpty ||
                        _workController.text.trim().isEmpty)) {
                      _isAllFieldsCompleted = false;
                    } else {
                      _isAllFieldsCompleted = true;
                    }
                  });
                },
                focusNode: _lastNameFocus,
                textEditingController: _lastNameController,
                hintText: 'Please enter your name',
              ),
              SizedBox(
                height: 14,
              ),
              Align(
                alignment: Alignment.centerLeft,
                child: Text.rich(
                  TextSpan(children: [
                    TextSpan(
                      text: 'Sex ',
                      style: GoogleFonts.roboto(
                        textStyle: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 18),
                      ),
                    ),
                    TextSpan(text: '(Exactly as listed on your ID card)')
                  ]),
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
                              fontWeight: FontWeight.w400, fontSize: 16),
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
                              fontWeight: FontWeight.w400, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(
                height: 20,
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Country',
                    style: GoogleFonts.roboto(
                      textStyle: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 18,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  CountryListPick(
                    useUiOverlay: true,
                    appBar: AppBar(
                      backgroundColor: AppColors.BUTTON_COLOR,
                      centerTitle: true,
                      iconTheme: IconThemeData(color: Colors.white),
                      title: Text('Pick your country'),
                    ),

                    pickerBuilder: (context, CountryCode? countryCode) {
                      return Container(
                        height: 50,
                        width: Get.width,
                        decoration: BoxDecoration(
                          color: AppColors.FORM_GREY,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 10,
                            ),
                            Expanded(
                              child: Text(
                                countryCode!.name!,
                                style: GoogleFonts.roboto(
                                  textStyle: TextStyle(
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              height: 20,
                              width: 40,
                              child: Image.asset(
                                countryCode.flagUri!,
                                package: 'country_list_pick',
                              ),
                            ),
                            SizedBox(
                              width: 8,
                            ),
                          ],
                        ),
                        /*child: FormInputWithHint(
                            label: 'Country',
                            onChanged: () {},
                            focusNode: FocusNode(),

                            hintText: 'Please enter your country',
                            isEnabled: true,

                            suffixIcon: Icon(
                              Icons.public_outlined,
                              color: Colors.black,
                            ),
                          ),*/
                      );
                    },
                    theme: CountryTheme(
                      isShowFlag: true,
                      isShowTitle: true,
                      isShowCode: true,
                      isDownIcon: true,
                      showEnglishName: true,
                      labelColor: Colors.blueAccent,
                    ),
                    initialSelection: '+86',
                    // or
                    // initialSelection: 'US'
                    onChanged: (CountryCode? code) {
                      _selectedCountry = code!.name!;
                      print(code.name);
                      print(code.code);
                      print(code.dialCode);
                      print(code.flagUri);
                    },
                  ),
                ],
              ),
              SizedBox(
                height: 14,
              ),
              FormInputWithHint(
                label: 'Occupation',
                onChanged: (value) {
                  setState(() {
                    if ((croppedFile == null ||
                        _firstNameController.text.trim().isEmpty ||
                        _lastNameController.text.trim().isEmpty ||
                        _workController.text.trim().isEmpty)) {
                      _isAllFieldsCompleted = false;
                    } else {
                      _isAllFieldsCompleted = true;
                    }
                  });
                },
                focusNode: _workFocus,
                textEditingController: _workController,
                hintText: 'Please enter your occupation',
                suffixIcon: Icon(
                  Icons.work_outline,
                  color: Colors.black,
                ),
              ),
              RoundedEdgeButton(
                  height: AppSizes.BUTTON_HEIGHT,
                  color: !_isAllFieldsCompleted
                      ? AppColors.BUTTON_COLOR_WITH_OPACITY
                      : AppColors.BUTTON_COLOR,
                  text: 'Confirm',
                  buttonRadius: AppSizes.BUTTON_RADIUS,
                  textColor: AppColors.WHITE,
                  textFontSize: AppSizes.BUTTON_FONT_SIZE,
                  topMargin: AppSizes.BUTTON_MARGIN,
                  onPressed: (value) async {
                    if (_isAllFieldsCompleted) {
                      try {
                        if (!(croppedFile == null ||
                            _firstNameController.text.trim().isEmpty ||
                            _lastNameController.text.trim().isEmpty ||
                            _workController.text.trim().isEmpty)) {
                          showCircularDialog(context);
                          print(getSharedPref.userDataModel.authToken!);
                          await _registerUserInformationController
                              .uploadUserImage(
                                  context,
                                  getSharedPref.userDataModel.authToken!,
                                  croppedFile!);

                          RegisterUserInforModel registerModel =
                              await _registerUserInformationController
                                  .sendUserInformationApi({
                            "firstName": _firstNameController.text.trim(),
                            "lastName": _lastNameController.text.trim(),
                            "gender": _radioSelected == 1 ? "MAN" : "WOMAN",
                            "country": _selectedCountry,
                            "work": _workController.text.trim()
                          }, getSharedPref.userDataModel.authToken!);
                          // showCircularDialog(context);
                          await _addLoginDeviceController.addLoginDeviceApi({
                            "userId":
                                getSharedPref.userDataModel.userId.toString(),
                            "osType": deviceModel,
                            "macAddress": "macAddress",
                            "deviceCode": deviceId
                          });

                          // popToPreviousScreen(context: context);
                          UserDataModel userDataModel = UserDataModel();
                          if (registerModel.flag!) {
                            SharedPreferences pref =
                                await SharedPreferences.getInstance();
                            userDataModel.authToken =
                                getSharedPref.userDataModel.authToken;
                            userDataModel.tokenExpire = getSharedPref
                                .userDataModel.tokenExpire
                                .toString();
                            userDataModel.refreshToken =
                                getSharedPref.userDataModel.refreshToken;
                            userDataModel.isNewUser = false;

                            userDataModel.refreshTokenExpire =
                                getSharedPref.userDataModel.refreshTokenExpire;
                            pref.setString(
                                'pin', registerModel.data!.user!.pin!);
                            log('${registerModel.data!.userInfo!.dateOfBirth!}');
                            pref.setString(
                                'birthDate',
                                registerModel.data!.userInfo!.dateOfBirth!
                                    .toString());
                            pref.setBool('isLoggedIn', true);
                            userDataModel.userEmail =
                                getSharedPref.userDataModel.userEmail;

                            userDataModel.userNumber =
                                getSharedPref.userDataModel.userNumber;
                            userDataModel.firstName =
                                registerModel.data!.userInfo!.firstName;
                            userDataModel.lastName =
                                registerModel.data!.userInfo!.lastName;
                            userDataModel.profilePicture =
                                registerModel.data!.userLogo!.bigLogoUrl;
                            userDataModel.dummyProfilePicture =
                                registerModel.data!.userLogo!.bigLogoUrl;
                            userDataModel.uniqueId =
                                getSharedPref.userDataModel.uniqueId;
                            userDataModel.userId =
                                getSharedPref.userDataModel.userId;
                            userDataModel.profileImageFile =
                                getSharedPref.userDataModel.profileImageFile;

                            userDataModel.isUserRegistered = true;
                            // userDataModel.isLoggedIn = true;
                            await getSharedPref
                                .saveSharedPreference(userDataModel);

                            popToPreviousScreen(context: context);

                            _firstNameFocus.unfocus();
                            _lastNameFocus.unfocus();
                            _workFocus.unfocus();

                            pref.setBool('isWelcomeWindowVisible', true);
                            // HelperMethods.pushToNextScreen(
                            //     FaceConfirmationPage());
                            HelperMethods.pushToNextScreen(HomeBasePage());
                          } else {
                            showError(
                                title: "Error",
                                message: registerModel.message.toString());
                          }
                        }
                      } catch (e) {
                        popToPreviousScreen(context: context);
                      }
                    }
                  },
                  context: context),
              SizedBox(
                height: 33,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    decoration: BoxDecoration(
                        shape: BoxShape.circle, color: AppColors.BUTTON_COLOR),
                    height: 14,
                    width: 14,
                    child: Center(
                      child: Text(
                        '!',
                        style: TextStyle(color: Colors.white, fontSize: 8),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 9,
                  ),
                  Text(
                    'It is recommended to fill in your true information',
                    style: GoogleFonts.roboto(
                      color: AppColors.DARK_GREY,
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                    ),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}

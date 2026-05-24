import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/consts/app_sizes.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/invite_emergency_contact_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/dialogs/app_dialogs.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';
import 'package:highfedilityadevar/views/widgets/rounded_edge_button.dart';

import '../../../controllers/account_security_emergency_contact/account_security_emergency_contact_controller.dart';
import '../../../models/account_security/emergency_contact/add_energency_user_model.dart';
import '../../../models/account_security/emergency_contact/search_emergency_contact_model.dart';
import '../../../models/account_security/emergency_contact/search_emergency_contact_model.dart'
    as search;

class EmergencyContactPage extends StatefulWidget {
  @override
  _EmergencyContactPageState createState() => _EmergencyContactPageState();
}

class _EmergencyContactPageState extends State<EmergencyContactPage>
    with BaseClass {
  int _selectedIndex = 0;
  bool isAddContactTapped = false;
  TextEditingController textEditingController = TextEditingController();
  AccountSecurityEmergencyContactController controller =
      AccountSecurityEmergencyContactController();

  List<search.Items> emergencyContactList = <search.Items>[].obs;
  List<search.Items> itemList = <search.Items>[].obs;
  ScrollController scrollController = ScrollController();
  int pageCount = 1;
  String countryCode = '+48';
  bool noDataFound = false;
  @override
  void initState() {
    pageCount = 1;
    scrollController = new ScrollController()..addListener(_scrollListener);
    // controller.getEmergencyContact();
    super.initState();
  }

  _scrollListener() async {
    if (scrollController.position.pixels ==
            scrollController.position.maxScrollExtent &&
        !scrollController.position.outOfRange) {
      pageCount++;
      searchContact();
      setState(() {});
    }
  }

  @override
  void dispose() {
    scrollController.removeListener(_scrollListener);
    super.dispose();
  }

  searchContact() async {
    try {
      showCircularDialog(context);
      itemList.clear();
      SearchEmergencyContactModel model =
          await controller.searchEmergencyContact(
              '$countryCode${textEditingController.text.toString().trim()}',
              pageCount);
      popToPreviousScreen(context: context);
      if (model.flag!) {
        noDataFound = true;
        itemList.assignAll(model.items!);
        for (int i = 0; i < itemList.length; i++) {
          if (itemList[i]
              .mobile
              .toString()
              .contains(textEditingController.text.toString())) {
            emergencyContactList.add(itemList[i]);
          } else {
            emergencyContactList.clear();
          }
        }

        setState(() {});
      } else {
        // emergencyContactList.clear();
        setState(() {});
      }
    } on Exception catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Emergency Contact',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: Container(
        height: Get.height,
        alignment: Alignment.center,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: 20,
            ),
            Image(
              image: AssetImage(
                AppImages.EMERGENCY_CONTACT_PICK,
              ),
              height: 100,
              width: 100,
            ),
            SizedBox(
              height: 10,
            ),
            Text(
              'Emergency Contact',
              style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontWeight: FontWeight.w400,
                  fontSize: 18),
            ),
            SizedBox(
              height: 10,
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Add a friend you can call at any\ntime as an emergency contact.',
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                    color: Colors.grey,
                    fontWeight: FontWeight.w400,
                    fontSize: 14),
              ),
            ),
            SizedBox(
              height: 20,
            ),
            // if (isAddContactTapped)
            Text(
              'You can add upto 5 emergency contact',
              style: GoogleFonts.roboto(
                  color: Colors.blue,
                  fontWeight: FontWeight.w400,
                  fontSize: 14),
            ),
            // if (!isAddContactTapped)
            // GestureDetector(
            //   onTap: () {
            //     setState(() {
            //       isAddContactTapped = true;
            //     });
            //   },
            //   child: Image(
            //     image: AssetImage(
            //       AppImages.ADD_EMERGENCY_CONTACT,
            //     ),
            //     height: 60,
            //     width: 60,
            //   ),
            // ),
            // if (isAddContactTapped)
            Container(
              margin: EdgeInsets.symmetric(horizontal: 30),
              child: FormInputWithHint(
                textEditingController: textEditingController,
                label: '',
                borderRadius: 15,
                onChanged: (value) async {
                  print('Hellor');

                  if (textEditingController.text.isEmpty) {
                    // searchContact();
                    emergencyContactList.clear();
                    setState(() {});
                    // } else {
                    //   setState(() {});
                    // }
                    // else {
                    //   setState(() {});
                  }
                },
                borderColor: Colors.blue,
                maxLength: 11,
                keyboardType: TextInputType.numberWithOptions(),
                focusNode: FocusNode(),
                hintText: 'Please enter the Phone number.',
                suffixIcon: InkWell(
                  onTap: () {
                    emergencyContactList.clear();
                    noDataFound = false;
                    FocusManager.instance.primaryFocus?.unfocus();
                    if (textEditingController.text.isNotEmpty) {
                      searchContact();
                      setState(() {});
                    } else {
                      emergencyContactList.clear();
                      setState(() {});
                    }
                  },
                  child: Icon(
                    Icons.search,
                    color: Colors.blue,
                  ),
                ),
                prefixIcon: Container(
                  width: 70,
                  padding: EdgeInsets.symmetric(horizontal: 0),
                  child: Row(
                    children: [
                      CountryListPick(
                        useUiOverlay: true,
                        appBar: AppBar(
                          backgroundColor: AppColors.BUTTON_COLOR,
                          centerTitle: true,
                          iconTheme: IconThemeData(color: Colors.white),
                          title: Text('Pick your country'),
                        ),

                        pickerBuilder: (context, CountryCode? countryCode) {
                          return Text(
                            '${countryCode!.dialCode}',
                            style: GoogleFonts.roboto(
                                color: Colors.black,
                                fontWeight: FontWeight.w400,
                                fontSize: 12),
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
                        initialSelection: '+48',
                        // or
                        // initialSelection: 'US'
                        onChanged: (CountryCode? code) {
                          countryCode = code!.dialCode!;
                          print(code.name);
                          print(code.code);
                          print(code.dialCode);
                          print(code.flagUri);
                        },
                      ),
                      Container(
                        height: 20,
                        width: 2,
                        color: AppColors.ICON_GREY,
                      )
                    ],
                  ),
                ),

                //  Container(
                //   width: 50,
                //   padding: EdgeInsets.symmetric(horizontal: 8),
                //   child: Row(
                //     children: [
                //       Text(
                //         '+48',
                //         style: GoogleFonts.roboto(
                //             color: Colors.black,
                //             fontWeight: FontWeight.w400,
                //             fontSize: 14),
                //       ),
                //       SizedBox(
                //         width: 5,
                //       ),
                //       Container(
                //         height: 20,
                //         width: 2,
                //         color: AppColors.ICON_GREY,
                //       )
                //     ],
                //   ),
                // ),
              ),
            ),

            if (emergencyContactList.isNotEmpty)
              Expanded(
                child: ListView.builder(
                  itemCount: emergencyContactList.length,
                  shrinkWrap: true,
                  controller: scrollController,
                  itemBuilder: (context, int index) {
                    return userInfoWidget(emergencyContactList, index);
                  },
                ),
              ),
            if (emergencyContactList.isEmpty &&
                textEditingController.text.isNotEmpty &&
                noDataFound == true)
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      SizedBox(
                        height: 15,
                      ),
                      Text(
                        'No Result',
                        style: GoogleFonts.roboto(
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 55),
                        child: Text(
                          'You can send an invitation to make him an adevar user and use him as your emergency contact. When he signs up, your settings will take effect.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.roboto(
                              color: Colors.grey,
                              fontWeight: FontWeight.w400,
                              fontSize: 14),
                        ),
                      ),
                      RoundedEdgeButton(
                          height: AppSizes.BUTTON_HEIGHT,
                          color: AppColors.BUTTON_COLOR,
                          text: 'Send',
                          leftMargin: 30,
                          rightMargin: 30,
                          buttonRadius: AppSizes.BUTTON_RADIUS,
                          textColor: AppColors.WHITE,
                          textFontSize: AppSizes.BUTTON_FONT_SIZE,
                          topMargin: AppSizes.BUTTON_MARGIN,
                          onPressed: (value) async {
                            AppDialogs.successDialog(context);
                            try {
                              IniviteEmergencyContactModel model =
                                  await controller.inviteEmergencyContact({
                                "mobile":
                                    '$countryCode${textEditingController.text.toString()}'
                              });
                              Get.back();
                              if (model.flag!) {
                                Get.back();
                              } else {
                                showError(
                                    title: 'Error', message: model.message!);
                              }
                            } catch (e) {}
                            // Future.delayed(const Duration(milliseconds: 1000), () {
                            //   Get.back();
                            //   // Get.to(()=>PublicQrPortfolioPage());
                            // Get.to(
                            //   () => AddedEmergencyContactsPage(),
                            // );
                            // });
                          },
                          context: context),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget userInfoWidget(List<search.Items> dataList, int index) {
    return InkWell(
      onTap: () async {
        try {
          // AppDialogs.successDialog(context);
          showCircularDialog(context);
          AddEmergencyContactModel model = await controller.addEmergencyContact(
              {"emergencyUserId": dataList[index].ecuserId});
          Get.back();
          if (model.flag!) {
            AppDialogs.successDialog(context);
            Get.back();
            //showSuccess(title: 'Success', message: model.message!);
            // Get.to(
            //   () => AddedEmergencyContactsPage(),
            // );
            // setState(() {});
            Get.back();
          } else {
            Get.back();
            showError(title: 'Error', message: model.message!);
          }
        } catch (e) {
          print(e);
          // showError(title: 'Error', message: e.toString());
        }
      },
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 15, horizontal: 20),
        margin: EdgeInsets.symmetric(horizontal: 20, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.BUTTON_COLOR.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Row(
          children: [
            dataList[index].logo.toString() != 'null'
                ? Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(40),
                      child: Image(
                        image: NetworkImage(dataList[index].logo.toString()),
                        height: 70,
                        width: 70,
                        fit: BoxFit.cover,
                      ),
                    ),
                  )
                : Image(
                    image: AssetImage(AppImages.face_confirm),
                    height: 70,
                    width: 70,
                  ),
            SizedBox(
              width: 15,
            ),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Text(
                          '${dataList[index].firstName} ${dataList[index].lastName}',
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              fontWeight: FontWeight.w400,
                              fontSize: 20,
                              color: Colors.black),
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      if (dataList[index].gender.toString() == 'Male')
                        Image(
                          image: AssetImage(AppImages.male),
                          width: 11,
                          height: 15,
                        ),
                      if (dataList[index].gender.toString() == 'Female')
                        Image(
                          image: AssetImage(AppImages.female),
                          width: 11,
                          height: 15,
                        ),
                    ],
                  ),
                  Text(
                    '${dataList[index].position}',
                    // 'Xiamen · UX designer',
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        color: AppColors.DARK_GREY),
                  ),
                  SizedBox(
                    height: 21,
                  ),
                  Text(
                    '${dataList[index].company.toString()} Technologies co.Ltd',
                    // ' Sabedoria Technologies co.Ltd ',
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        color: AppColors.DARK_GREY),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

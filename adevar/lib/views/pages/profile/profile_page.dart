import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:badges/badges.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/get_user_data/user_profile_controller.dart';
import 'package:highfedilityadevar/models/me_user_model/UserProfileModel.dart';
import 'package:highfedilityadevar/utils/AppDataNotifiier.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/process_indicator.dart';
import 'package:highfedilityadevar/utils/utils.dart';
import 'package:highfedilityadevar/views/dialogs/logout_dialog.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/edit_profile_page.dart';
import 'package:highfedilityadevar/views/pages/invitations/invitations_page.dart';
import 'package:highfedilityadevar/views/pages/invite_friends/invite_friends_page.dart';
import 'package:highfedilityadevar/views/pages/my_badges/my_badges_page.dart';
import 'package:highfedilityadevar/views/pages/recent_comments/recent_comments_page.dart';
import 'package:highfedilityadevar/views/pages/recent_contacts/recent_contacts_page.dart';
import 'package:highfedilityadevar/views/pages/settings/settings_page.dart';
import 'package:provider/provider.dart';
import 'package:share/share.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controllers/user_data/get_shared_pref.dart';

import '../../../micheal_code/ui/adevar_forum.dart';
import '../../../models/user_data/user_model.dart';
import '../../../utils/SessionManager.dart';

class ProfilePage extends StatefulWidget {
  @override
  State<ProfilePage> createState() => ProfilePageState();
}

class ProfilePageState extends State<ProfilePage>
    with BaseClass, WidgetsBindingObserver {
  void handleSlideAnimationChanged(Animation<double>? slideAnimation) {}
  static Circle processIndicator = Circle();

  bool isSideOpen = false;
  bool errorInApi = false;
  var authToken;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  UserDataModel? userDataModel;

  UserProfileModel? _userProfileModel;

  final UserProfileController _userProfileController =
      Get.isRegistered<UserProfileController>()
          ? Get.find<UserProfileController>()
          : Get.put(UserProfileController());

  void handleSlideIsOpenChanged(bool? isOpen) {
    try {
      print(isOpen);
      isSideOpen = isOpen!;
      setState(() {});
    } catch (error) {
      print(error.toString());
    }
  }

  late final SlidableController slidableController;

  @override
  void initState() {
    slidableController = SlidableController(
      onSlideIsOpenChanged: handleSlideIsOpenChanged,
      onSlideAnimationChanged: handleSlideAnimationChanged,
    );

    WidgetsBinding.instance!.addPostFrameCallback((_) {
      _getSharedPref.getUserData().then((value) {
        userDataModel = value;
        authToken = userDataModel?.authToken;
        print(userDataModel!.profilePicture);
        setState(() {});
      });
    });
    super.initState();
    Future.delayed(Duration(seconds: 0), () {
      // getUserProfile();
      getShareData();
    });
    WidgetsBinding.instance?.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance?.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      WidgetsBinding.instance!.addPostFrameCallback((_) {
        _getSharedPref.getUserData().then((value) {
          userDataModel = value;
          authToken = userDataModel?.authToken;
          setState(() {});
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileImage = context.watch<AppDataNotifier>();
    return Scaffold(
        appBar: AppBar(
          title: Text(
            '',
            style: GoogleFonts.roboto(color: Colors.black),
          ),
          centerTitle: true,
          automaticallyImplyLeading: false,
        ),
        body: RefreshIndicator(
            onRefresh: () async {
              getUserProfile();
            },
            child: SingleChildScrollView(
              child: WillPopScope(
                onWillPop: () async {
                  SystemNavigator.pop();
                  return false;
                },
                child: _userProfileModel?.data != null
                    ? Container(
                        height: MediaQuery.of(context).size.height,
                        child: SingleChildScrollView(
                          child: Container(
                            child: Column(
                              children: [
                                Slidable(
                                  actionPane: SlidableDrawerActionPane(),
                                  controller: slidableController,
                                  secondaryActions: [
                                    GestureDetector(
                                      onTap: () {
                                        Get.to(() => EditProfilePage())!
                                            .then((value) => getUserProfile());

                                        slidableController.activeState!.close();
                                      },
                                      child: Container(
                                        margin: EdgeInsets.only(right: 0),

                                        /*      child: Icon(Icons.cancel,color: Colors.red.shade900,size: 50,)*/
                                        child: Image(
                                          image: AssetImage(
                                              AppImages.EDIT_PROFILE),
                                          height: 50,
                                          width: 50,
                                        ),
                                      ),
                                    ),
                                  ],
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Container(
                                          margin: EdgeInsets.only(left: 20),
                                          height: 200,
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color: AppColors.FORM_GREY,
                                            borderRadius:
                                                BorderRadius.circular(15),
                                          ),
                                          child: Stack(
                                            children: [
                                              Align(
                                                alignment:
                                                    Alignment.centerRight,
                                                child: GestureDetector(
                                                  onTap: () {},
                                                  child: Container(
                                                    margin: EdgeInsets.only(
                                                        right: 10),
                                                    child: Image(
                                                      image: AssetImage(
                                                          AppImages
                                                              .ME_BACKGROUND),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                margin: EdgeInsets.only(
                                                    left: 15,
                                                    right: 15,
                                                    top: 15,
                                                    bottom: 20),
                                                child: Column(
                                                  children: [
                                                    Container(
                                                      child: Row(
                                                        children: [
                                                          _userProfileModel
                                                                      ?.data !=
                                                                  null
                                                              ? Container(
                                                                  width: 70,
                                                                  height: 70,
                                                                  decoration:
                                                                      new BoxDecoration(
                                                                    shape: BoxShape
                                                                        .circle,
                                                                  ),
                                                                  child: ClipRRect(
                                                                      borderRadius: BorderRadius.circular(75.0),
                                                                      child: profileImage.croppedImageUrl != ""
                                                                          ? Image.network(
                                                                              profileImage.croppedImageUrl,
                                                                              fit: BoxFit.fill,
                                                                              height: 80,
                                                                              width: 80,
                                                                            )
                                                                          : userDataModel?.profilePicture == null || userDataModel?.profilePicture == ""
                                                                              ? Image.asset(
                                                                                  AppImages.DEFAULT_USER_PROFILE,
                                                                                  height: 80,
                                                                                  width: 80,
                                                                                )
                                                                              : Image.network(
                                                                                  userDataModel!.profilePicture!,
                                                                                  height: 80,
                                                                                  width: 80,
                                                                                )),
                                                                )
                                                              : Container(
                                                                  height: 70,
                                                                  width: 70,
                                                                ),
                                                          SizedBox(
                                                            width: 5,
                                                          ),
                                                          Expanded(
                                                            child: Column(
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .start,
                                                              children: [
                                                                SizedBox(
                                                                  height: 15,
                                                                ),
                                                                Text(
                                                                  userDataModel
                                                                          ?.firstName ??
                                                                      "",
                                                                  overflow:
                                                                      TextOverflow
                                                                          .ellipsis,
                                                                  style:
                                                                      GoogleFonts
                                                                          .roboto(
                                                                    color: Colors
                                                                        .black,
                                                                    fontSize:
                                                                        28,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w700,
                                                                  ),
                                                                ),
                                                                SizedBox(
                                                                  height: 8,
                                                                ),
                                                                userDataModel !=
                                                                        null
                                                                    ? Text(
                                                                        'ID：${userDataModel!.userId}',
                                                                        style: GoogleFonts
                                                                            .roboto(
                                                                          color:
                                                                              AppColors.NOTIFICATION_GREY,
                                                                          fontSize:
                                                                              12,
                                                                          fontWeight:
                                                                              FontWeight.w400,
                                                                        ),
                                                                      )
                                                                    : Container(),
                                                                /* Padding(
                                                                    padding: EdgeInsets.only(top:7.0,left: MediaQuery.of(context).size.width*0.33),
                                                                    child: Text(
                                                                      "注册日期：${simplyFormat(time: DateTime.parse(_userProfileModel!.registerDate.toString()), dateOnly: true)}",
                                                                      style: GoogleFonts
                                                                          .roboto(
                                                                        color:
                                                                        AppColors.NOTIFICATION_GREY.withAlpha(110),
                                                                        fontSize:
                                                                        11,
                                                                        fontWeight:
                                                                        FontWeight.w400,
                                                                      ),
                                                                    ),
                                                                  ),*/
                                                              ],
                                                            ),
                                                          ),
                                                          // Spacer(),
                                                          Container(
                                                            decoration:
                                                                BoxDecoration(
                                                              borderRadius:
                                                                  BorderRadius
                                                                      .circular(
                                                                          7),
                                                              gradient: LinearGradient(
                                                                  colors: [
                                                                    AppColors
                                                                        .LIGHT_ORANGE,
                                                                    AppColors
                                                                        .DARK_ORANGE
                                                                  ],
                                                                  begin:
                                                                      const FractionalOffset(
                                                                          0.0,
                                                                          0.0),
                                                                  end:
                                                                      const FractionalOffset(
                                                                          0.5,
                                                                          0.0),
                                                                  stops: [
                                                                    0.0,
                                                                    1.0
                                                                  ],
                                                                  tileMode:
                                                                      TileMode
                                                                          .clamp),
                                                            ),
                                                            child: Center(
                                                              child: Padding(
                                                                padding: const EdgeInsets
                                                                        .symmetric(
                                                                    horizontal:
                                                                        8.0,
                                                                    vertical:
                                                                        8.0),
                                                                child: Text(
                                                                  _userProfileModel
                                                                              ?.vipLv ==
                                                                          1
                                                                      ? "Vip"
                                                                      : "Personal",
                                                                  style:
                                                                      GoogleFonts
                                                                          .roboto(
                                                                    color: AppColors
                                                                        .NOTIFICATION_GREY,
                                                                    fontSize:
                                                                        10,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w400,
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                          // SizedBox(
                                                          //   width: 20,
                                                          // ),
                                                        ],
                                                      ),
                                                    ),
                                                    SizedBox(
                                                      height: 30,
                                                    ),
                                                    Row(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .spaceBetween,
                                                      children: [
                                                        Flexible(
                                                          child: Column(
                                                            children: [
                                                              getUserAboutWidget(
                                                                userDataModel
                                                                        ?.userNumber ??
                                                                    "",
                                                                Image(
                                                                  image: AssetImage(
                                                                      AppImages
                                                                          .SMART_PHONE),
                                                                  height: 18,
                                                                  width: 18,
                                                                ),
                                                              ),
                                                              SizedBox(
                                                                height: 15,
                                                              ),
                                                              getUserAboutWidget(
                                                                  userDataModel
                                                                          ?.userEmail ??
                                                                      "",
                                                                  Icon(
                                                                    Icons
                                                                        .mail_outline_sharp,
                                                                    color: AppColors
                                                                        .NOTIFICATION_GREY,
                                                                    size: 18,
                                                                  )),
                                                            ],
                                                          ),
                                                        ),
                                                        SizedBox(
                                                          width: 25,
                                                        ),
                                                        Flexible(
                                                          child: Column(
                                                            children: [
                                                              getUserAboutWidget(
                                                                _userProfileModel
                                                                        ?.position ??
                                                                    "",
                                                                Image(
                                                                  image: AssetImage(
                                                                      AppImages
                                                                          .USER_BLACK),
                                                                  height: 18,
                                                                  width: 18,
                                                                ),
                                                              ),
                                                              SizedBox(
                                                                height: 15,
                                                              ),
                                                              getUserAboutWidget(
                                                                  "${_userProfileModel?.city ?? ""}.${_userProfileModel?.country ?? ""}",
                                                                  Icon(
                                                                    Icons
                                                                        .language,
                                                                    color: AppColors
                                                                        .NOTIFICATION_GREY,
                                                                    size: 18,
                                                                  )),
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              )
                                            ],
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        width: 5,
                                      ),
                                      !isSideOpen
                                          ? Container(
                                              width: 15,
                                              child: Image(
                                                image: AssetImage(
                                                    AppImages.side_slider),
                                              ),
                                            )
                                          : Container(
                                              width: 15,
                                            )
                                    ],
                                  ),
                                ),
                                SizedBox(
                                  height: 10,
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  padding: EdgeInsets.all(15),
                                  decoration: BoxDecoration(
                                    color: AppColors.FORM_GREY,
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  width: double.infinity,
                                  child: Row(
                                    children: [
                                      SizedBox(
                                        width: 20,
                                      ),
                                      Image(
                                        image: AssetImage(AppImages.SPEAKER),
                                        height: 16,
                                        width: 16,
                                      ),
                                      SizedBox(
                                        width: 20,
                                      ),
                                      Text(
                                        '升级企业版  更多特权  敬请期待',
                                        style: GoogleFonts.roboto(
                                            color: AppColors.NOTIFICATION_GREY,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400),
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(
                                  height: 10,
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  padding: EdgeInsets.all(15),
                                  decoration: BoxDecoration(
                                    color: AppColors.FORM_GREY,
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            Provider.of<AppDataNotifier>(
                                                    context,
                                                    listen: false)
                                                .setInvitationIndex(0);
                                            Provider.of<AppDataNotifier>(
                                                    context,
                                                    listen: false)
                                                .setInvitationStatus(0);
                                            Get.to(() => InvitationsPage())!
                                                .then((value) =>
                                                    getUserProfile());
                                          },
                                          child: Container(
                                            child: Column(
                                              children: [
                                                Badge(
                                                  child: Text(
                                                    _userProfileModel!
                                                        .invitationCount
                                                        .toString(),
                                                    style: GoogleFonts.roboto(
                                                        fontWeight:
                                                            FontWeight.w400,
                                                        fontSize: 24,
                                                        color: AppColors
                                                            .BUTTON_COLOR),
                                                  ),
                                                  showBadge: _userProfileModel!
                                                              .newInvitationCount !=
                                                          0 &&
                                                      _userProfileModel!
                                                              .newInvitationCount !=
                                                          null,
                                                  position:
                                                      BadgePosition.bottomEnd(
                                                          bottom: 15, end: -15),
                                                  badgeContent: Container(
                                                    child: Text(
                                                      _userProfileModel!
                                                          .newInvitationCount
                                                          .toString(),
                                                      style: GoogleFonts.roboto(
                                                          fontWeight:
                                                              FontWeight.w400,
                                                          fontSize: 14,
                                                          color: Colors.white),
                                                    ),
                                                  ),
                                                ),
                                                Text(
                                                  'Invitation',
                                                  style: GoogleFonts.roboto(
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      fontSize: 12,
                                                      color: Colors.black),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            Get.to(() => RecentContactsPage())!
                                                .then((value) =>
                                                    getUserProfile());
                                          },
                                          child: Container(
                                            child: Column(
                                              children: [
                                                Text(
                                                  _userProfileModel!.meetUpCount
                                                      .toString(),
                                                  style: GoogleFonts.roboto(
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      fontSize: 24,
                                                      color: AppColors
                                                          .BUTTON_COLOR),
                                                ),
                                                Text(
                                                  'Contact',
                                                  style: GoogleFonts.roboto(
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      fontSize: 12,
                                                      color: Colors.black),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            Get.to(() => RecentCommentsPage(
                                                      userId: '',
                                                    ))!
                                                .then((value) =>
                                                    getUserProfile());
                                          },
                                          child: Container(
                                            child: Column(
                                              children: [
                                                Badge(
                                                  child: Text(
                                                    _userProfileModel!
                                                        .evaluateCount
                                                        .toString(),
                                                    style: GoogleFonts.roboto(
                                                        fontWeight:
                                                            FontWeight.w400,
                                                        fontSize: 24,
                                                        color: AppColors
                                                            .BUTTON_COLOR),
                                                  ),
                                                  showBadge: _userProfileModel!
                                                              .newEvaluateCount !=
                                                          0 &&
                                                      _userProfileModel!
                                                              .newEvaluateCount !=
                                                          null,
                                                  position:
                                                      BadgePosition.bottomEnd(
                                                          bottom: 15, end: -15),
                                                  badgeContent: Text(
                                                    _userProfileModel!
                                                        .newEvaluateCount
                                                        .toString(),
                                                    style: GoogleFonts.roboto(
                                                        fontWeight:
                                                            FontWeight.w400,
                                                        fontSize: 14,
                                                        color: Colors.white),
                                                  ),
                                                ),
                                                Text(
                                                  'Comment',
                                                  style: GoogleFonts.roboto(
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      fontSize: 12,
                                                      color: Colors.black),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(
                                  height: 26,
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  child: ListTile(
                                    title: Text(
                                      'Badge',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 16,
                                          color: AppColors.BLACK_SHADE),
                                    ),
                                    trailing: Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      color: AppColors.LIGHT_GREY,
                                    ),
                                    onTap: () {
                                      Get.to(() => MyBadgesPage())!
                                          .then((value) => getUserProfile());
                                    },
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  child: Divider(),
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  child: ListTile(
                                    title: Text(
                                      'Settings',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 16,
                                          color: AppColors.BLACK_SHADE),
                                    ),
                                    trailing: Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      color: AppColors.LIGHT_GREY,
                                    ),
                                    onTap: () {
                                      Get.to(() => SettingsPage())!
                                          .then((value) => getUserProfile());
                                    },
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  child: Divider(),
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  child: ListTile(
                                    onTap: () {
                                      Get.to(() => InviteFriendsPage())!
                                          .then((value) => getUserProfile());
                                    },
                                    title: Text(
                                      'Invite friends',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 16,
                                          color: AppColors.BLACK_SHADE),
                                    ),
                                    trailing: Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      color: AppColors.LIGHT_GREY,
                                    ),
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.symmetric(horizontal: 20),
                                  child: Divider(),
                                ),
                                // Container(
                                //   margin: EdgeInsets.symmetric(horizontal: 20),
                                //   child: ListTile(
                                //     onTap: () {
                                //       Get.to(() => AdevarForum());
                                //     },
                                //     title: Text(
                                //       'Feature request',
                                //       style: GoogleFonts.roboto(
                                //           fontWeight: FontWeight.w400,
                                //           fontSize: 16,
                                //           color: AppColors.BLACK_SHADE),
                                //     ),
                                //     trailing: Icon(
                                //       Icons.arrow_forward_ios_rounded,
                                //       color: AppColors.LIGHT_GREY,
                                //     ),
                                //   ),
                                // ),
                                /*InkWell(
                                    onTap: () {
                                      print("TAP");
                                      LogoutDialog.logoutDialog(context);
                                    },
                                    child: Container(
                                      width: double.infinity,
                                      margin: EdgeInsets.symmetric(
                                          horizontal: 36, vertical: 29),
                                      padding: EdgeInsets.all(15),
                                      decoration: BoxDecoration(
                                        color: AppColors.FORM_GREY,
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                      child: Center(
                                        child: Text(
                                          'Log out',
                                          style: GoogleFonts.roboto(
                                              fontWeight: FontWeight.w400,
                                              fontSize: 18,
                                              color: AppColors.BUTTON_COLOR),
                                        ),
                                      ),
                                    ),
                                  )*/
                              ],
                            ),
                          ),
                        ),
                      )
                    : errorInApi
                        ? Center(
                            child: Container(
                            width: MediaQuery.of(context).size.width,
                            height: MediaQuery.of(context).size.height,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  "Something went wrong! Please try again later!",
                                  style: GoogleFonts.roboto(
                                      color: Colors.black,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400),
                                ),
                                SizedBox(
                                  height: 25,
                                ),
                                ElevatedButton(
                                    onPressed: () {
                                      getUserProfile();
                                      setState(() {
                                        errorInApi = false;
                                      });
                                    },
                                    child: Text(
                                      "Refresh",
                                      style: GoogleFonts.roboto(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w400,
                                          fontSize: 16),
                                    ))
                              ],
                            ),
                          ))
                        : Container(),
              ),
            )));
  }

  Widget getUserAboutWidget(String title, Widget icon) {
    return Row(
      children: [
        icon,
        SizedBox(
          width: 2,
        ),
        Expanded(
          child: Text(
            title,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.roboto(
                color: AppColors.NOTIFICATION_GREY,
                fontSize: 12,
                fontWeight: FontWeight.w400),
          ),
        ),
      ],
    );
  }

  void getUserProfile() async {
    UserPref.userPref = await SharedPreferences.getInstance();
    try {
      _userProfileModel =
          await _userProfileController.getUserProfile(authToken);
      if (_userProfileModel?.flag) {
        // showSuccess(title: 'Success', message: _userProfileModel?.message);
        if (_userProfileModel?.data != null) {
          userDataModel!.firstName = _userProfileModel?.firstName.toString();
          userDataModel!.profilePicture = _userProfileModel?.logo.toString();
          Provider.of<AppDataNotifier>(context, listen: false)
              .updateProfileImage(userDataModel?.profilePicture ?? "");
          userDataModel!.userId = _userProfileModel?.userId.toString();
          userDataModel!.userNumber = _userProfileModel?.mobile.toString();
          userDataModel!.userEmail = _userProfileModel?.email.toString();
          _getSharedPref.saveSharedPreference(userDataModel!);
          setState(() {});
        }
      } else {
        throw _userProfileModel!.message.toString();
      }
    } catch (e) {
      errorInApi = true;
      setState(() {});
      // showError(title: 'Error', message: e.toString());
    }
  }

  void getShareData() async {
    UserPref.userPref = await SharedPreferences.getInstance();
    try {
      await processIndicator.show(context);
      // showCircularDialog(context);
      _userProfileModel =
          await _userProfileController.getUserProfile(authToken);
      // popToPreviousScreen(context: context);
      processIndicator.hide(context);
      if (_userProfileModel?.flag) {
        // showSuccess(title: 'Success', message: _userProfileModel?.message);
        if (_userProfileModel?.data != null) {
          userDataModel!.firstName = _userProfileModel?.firstName.toString();
          userDataModel!.profilePicture = _userProfileModel?.logo.toString();
          Provider.of<AppDataNotifier>(context, listen: false)
              .updateProfileImage(userDataModel?.profilePicture ?? "");
          userDataModel!.userId = _userProfileModel?.userId.toString();
          userDataModel!.userNumber = _userProfileModel?.mobile ?? "";
          userDataModel!.userEmail = _userProfileModel?.email ?? "";
          _getSharedPref.saveSharedPreference(userDataModel!);
          setState(() {});
        }
      } else {
        showError(title: 'Error', message: _userProfileModel?.message);
        // throw _userProfileModel!.message.toString();
      }
    } catch (e) {
      processIndicator.hide(context);
      // popToPreviousScreen(context: context);
      errorInApi = true;
      setState(() {});
      // showError(title: 'Error', message: e.toString());
    }
  }
}

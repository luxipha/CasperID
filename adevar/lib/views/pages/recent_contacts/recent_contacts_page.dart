import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/socialContactsController/SocialContactsController.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/recent_contact_page_model/RecentContactsModel.dart';
import '../../../models/user_data/user_model.dart';

class RecentContactsPage extends StatefulWidget {
  @override
  _RecentContactsPageState createState() => _RecentContactsPageState();
}

class _RecentContactsPageState extends State<RecentContactsPage>
    with BaseClass {
  void handleSlideAnimationChanged(Animation<double>? slideAnimation) {}

  void handleSlideIsOpenChanged(bool? isOpen) {
    try {
      print(isOpen);
    } catch (error) {
      print(error.toString());
    }
  }

  RecentContactsModel? recentContactsModel;
  List<RecentContactsData>? recentContactsData;
  late final SlidableController slidableController;

  bool recentContactsLoaded = false;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final SocialContactController _socialContactController =
      Get.isRegistered<SocialContactController>()
          ? Get.find<SocialContactController>()
          : Get.put(SocialContactController());

  @override
  void initState() {
    slidableController = SlidableController(
      onSlideIsOpenChanged: handleSlideIsOpenChanged,
      onSlideAnimationChanged: handleSlideAnimationChanged,
    );
    super.initState();

    getRecentContacts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Recent Contacts',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: recentContactsLoaded
          ? Container(
              child: ListView.builder(
                  itemCount: recentContactsData?.length,
                  itemBuilder: (BuildContext context, int index) {
                    return Container(
                      margin: EdgeInsets.symmetric(vertical: 5, horizontal: 20),
                      child: Slidable(
                        actionPane: SlidableDrawerActionPane(),
                        controller: slidableController,
                        actions: <Widget>[
                          InkWell(
                            onTap: () {
                              blockRecentContact(
                                  recentContactsData![index]
                                      .myFriendId!
                                      .toString(),
                                  index);
                              slidableController.activeState!.close();
                            },
                            child: Container(
                              margin: EdgeInsets.only(left: 10, right: 10),
                              decoration: BoxDecoration(
                                  color: AppColors.ON_BOARD_BUTTON_ONE,
                                  borderRadius: BorderRadius.circular(15)),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image(
                                    image: AssetImage(AppImages.BLOCK),
                                    height: 22,
                                    width: 22,
                                  ),
                                  SizedBox(
                                    height: 14,
                                  ),
                                  Text(
                                    'Block',
                                    style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 12,
                                        color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                        secondaryActions: <Widget>[
                          InkWell(
                            onTap: () {
                              removeRecentContact(
                                  recentContactsData![index]
                                      .myFriendId!
                                      .toString(),
                                  index);
                              slidableController.activeState!.close();
                            },
                            child: Container(
                              margin: EdgeInsets.only(left: 10, right: 10),
                              decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(15)),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Image(
                                    image: AssetImage(AppImages.REMOVE),
                                    height: 17,
                                    width: 17,
                                  ),
                                  SizedBox(
                                    height: 14,
                                  ),
                                  Text(
                                    'Remove',
                                    style: GoogleFonts.roboto(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 12,
                                        color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                        child: Container(
                          padding:
                              EdgeInsets.only(top: 15, bottom: 15, left: 20),
                          decoration: BoxDecoration(
                              color: AppColors.FORM_GREY,
                              borderRadius: BorderRadius.circular(15)),
                          child: Row(
                            children: [
                              ClipOval(
                                child: Image.network(
                                  recentContactsData?[index].logo,
                                  height: 60,
                                  width: 60,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              SizedBox(
                                width: 21,
                              ),
                              Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        '${recentContactsData?[index].firstName} ${recentContactsData?[index].lastName} ',
                                        style: GoogleFonts.roboto(
                                            fontWeight: FontWeight.w400,
                                            fontSize: 20,
                                            color: Colors.black),
                                      ),
                                      SizedBox(
                                        width: 10,
                                      ),
                                      recentContactsData?[index].gender == 'man'
                                          ? Image(
                                              image: AssetImage(AppImages.male),
                                              width: 11,
                                              height: 15,
                                            )
                                          : Image(
                                              image:
                                                  AssetImage(AppImages.female),
                                              width: 11,
                                              height: 15,
                                            ),
                                    ],
                                  ),
                                  Container(
                                    width: MediaQuery.of(context).size.width *
                                        0.45,
                                    child: Text(
                                      '${recentContactsData?[index].city} · ${recentContactsData?[index].position}',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 12,
                                          color: AppColors.DARK_GREY),
                                    ),
                                  ),
                                  SizedBox(
                                    height: 10,
                                  ),
                                  Container(
                                    child: Text(
                                      '${recentContactsData?[index].companyName}',
                                      style: GoogleFonts.roboto(
                                          fontWeight: FontWeight.w400,
                                          fontSize: 12,
                                          color: AppColors.DARK_GREY),
                                    ),
                                  ),
                                ],
                              ),
                              Spacer(),
                              recentContactsData?[index].lastOnline == "now"
                                  ? Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        SizedBox(
                                          height: 50,
                                        ),
                                        Row(
                                          children: [
                                            CircleAvatar(
                                              radius: 3,
                                              backgroundColor: Colors.green,
                                            ),
                                            SizedBox(
                                              width: 3,
                                            ),
                                            Text(
                                              "Online",
                                              style: GoogleFonts.roboto(
                                                color: Colors.green,
                                                fontSize: 10,
                                                fontWeight: FontWeight.w400,
                                              ),
                                            ),
                                            SizedBox(
                                              width: 12,
                                            ),
                                          ],
                                        )
                                      ],
                                    )
                                  : Container()
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
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

  void getRecentContacts() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      recentContactsModel = await _socialContactController.getRecentContacts(
          userDataModel.authToken.toString(), "1", "20");
      if (recentContactsModel?.flag) {
        // showSuccess(title: "Success", message: recentContactsModel?.message);
        recentContactsLoaded = true;
        setState(() {
          if (recentContactsModel?.recentContacts != null) {
            recentContactsData = recentContactsModel?.recentContacts;
          }
        });
      } else {
        throw recentContactsModel?.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  void removeRecentContact(String friendUserId, int index) async {
    showCircularDialog(context);
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    final Map<String, String> params = {"friendUserId": friendUserId};
    try {
      var model = await _socialContactController.removeRecentContact(
          params, userDataModel.authToken.toString());
      Navigator.pop(context);
      if (model.flag) {
        showSuccess(title: "Success", message: model.message);
        setState(() {
          recentContactsData?.removeAt(index);
        });
      } else {
        throw recentContactsModel?.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error", message: error.toString());
    }
  }

  void blockRecentContact(String friendUserId, int index) async {
    showCircularDialog(context);
    UserDataModel userDataModel = await _getSharedPref.getUserData();

    try {
      var model = await _socialContactController.blockRecentContact(
          friendUserId, userDataModel.authToken.toString());
      Navigator.pop(context);
      if (model.flag) {
        showSuccess(title: "Success", message: model.message);
        setState(() {
          recentContactsData?.removeAt(index);
        });
      } else {
        throw model.message;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
  }
}

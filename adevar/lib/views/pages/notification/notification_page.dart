import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/home_page_controller/user_profile_controller.dart';
import 'package:highfedilityadevar/micheal_widgets/recent_comments.dart';
import 'package:highfedilityadevar/models/home/get_notification_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/invitations/invitations_page.dart';
import 'package:highfedilityadevar/views/pages/recent_comments/recent_comments_page.dart';
import 'package:intl/intl.dart';

class NotificationPage extends StatefulWidget {
  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> with BaseClass {
  final HomeScreenController controller = HomeScreenController();
  List<Items> notificationList = [];
  ScrollController scrollController = ScrollController();
  int pageCount = 1;
  @override
  void initState() {
    pageCount = 1;
    notificationList.clear();
    getAllNotification();
    scrollController = new ScrollController()..addListener(_scrollListener);
    // controller.getEmergencyContact();
    super.initState();
  }

  _scrollListener() async {
    if (scrollController.position.pixels ==
            scrollController.position.maxScrollExtent &&
        !scrollController.position.outOfRange) {
      pageCount++;
      getAllNotification();
      setState(() {});
    }
  }

  @override
  void dispose() {
    scrollController.removeListener(_scrollListener);
    super.dispose();
  }

  getAllNotification() async {
    try {
      List<Items> itemList = [];
      Future.delayed(Duration(milliseconds: 1), () {
        showCircularDialog(context);
      });
      GetAllNotificationModel model =
          await controller.getNotification(pageCount);
      popToPreviousScreen(context: context);

      if (model.flag!) {
        itemList = model.items!;
        notificationList.addAll(itemList);
      } else {
        showError(title: 'Error', message: model.message!);
      }
      setState(() {});
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  deleteNotification(index, id) async {
    try {
      showCircularDialog(context);

      dynamic model = await controller.deleteNotification(id);
      popToPreviousScreen(context: context);

      if (model['flag']) {
        notificationList.removeAt(index);
      } else {
        showError(title: 'Error', message: model.message!);
      }
      setState(() {});
    } catch (e) {
      popToPreviousScreen(context: context);
      // showError(title: 'Error', message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notification',
          style: GoogleFonts.abel(
              color: Colors.black, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
      ),
      body: Container(
        child: notificationList.length != 0
            ? ListView.builder(
                itemCount: notificationList.length,
                shrinkWrap: true,
                controller: scrollController,
                itemBuilder: (BuildContext context, int index) {
                  return Slidable(
                    actionPane: SlidableDrawerActionPane(),
                    secondaryActions: [
                      InkWell(
                        onTap: () {
                          deleteNotification(
                              index, notificationList[index].notificationId);
                        },
                        child: Container(
                          margin: EdgeInsets.only(right: 10),

                          /*      child: Icon(Icons.cancel,color: Colors.red.shade900,size: 50,)*/
                          child: Image(
                            image: AssetImage(AppImages.NOTIFICATION_REMOVE),
                            height: 50,
                            width: 50,
                          ),
                        ),
                      ),
                    ],
                    child: InkWell(
                      onTap: () {
                        if (notificationList[index]
                                .notificationType
                                .toString() ==
                            '12') {
                          Get.to(
                            () => RecentCommentsPage(
                              userId: '',
                              fromNotification: true,
                            ),
                          );
                        } else if (notificationList[index]
                                .notificationType
                                .toString() ==
                            '14') {
                          Get.to(
                            () => InvitationsPage(),
                          );
                        } else if (notificationList[index]
                                .notificationType
                                .toString() ==
                            '11') {
                          Get.to(
                            () => InvitationsPage(
                              fromNotification: true,
                            ),
                          );
                        }
                      },
                      child: Container(
                        margin:
                            EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        padding: EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.FORM_GREY,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 10,
                            ),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(40),
                              child: Image.network(
                                notificationList[index].userLogo!,
                                height: 70,
                                width: 70,
                                fit: BoxFit.cover,
                              ),
                            ),
                            // Image(
                            //   image: AssetImage(AppImages.user_one),
                            //   width: 70,
                            //   height: 70,
                            // ),
                            SizedBox(
                              width: 12,
                            ),
                            Expanded(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${notificationList[index].firstName!}${notificationList[index].lastName!}',
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.abel(
                                            color: Colors.black,
                                            fontSize: 18,
                                            fontWeight: FontWeight.w700),
                                      ),
                                      Text(
                                        DateTime.now().day !=
                                                DateTime.parse(
                                                        notificationList[index]
                                                            .sendDate!)
                                                    .day
                                            ? DateFormat('HH:mm MM/dd').format(
                                                DateTime.parse(
                                                    notificationList[index]
                                                        .sendDate!),
                                              )
                                            : DateFormat('HH:mm').format(
                                                DateTime.parse(
                                                    notificationList[index]
                                                        .sendDate!),
                                              ),
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.abel(
                                            color: AppColors.DARK_GREY,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400),
                                      )
                                    ],
                                  ),
                                  Text(
                                    notificationList[index].text!,
                                    style: GoogleFonts.abel(
                                        color: AppColors.NOTIFICATION_GREY,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(
                              width: 10,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                })
            : Center(
                child: Text('No notification Found'),
              ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_global_data.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/models/recentCommentsModel/RecentCommentsModel.dart';
import 'package:simple_gesture_detector/simple_gesture_detector.dart';

import '../../../utils/utils.dart';

class ReceivedCommentsPage extends StatefulWidget {
  final List<RecentCommentsData> receivedComments;

  const ReceivedCommentsPage({Key? key, required this.receivedComments})
      : super(key: key);

  @override
  State<ReceivedCommentsPage> createState() => _ReceivedCommentsPageState();
}

class _ReceivedCommentsPageState extends State<ReceivedCommentsPage> {
  List<RecentCommentsData> recentCommentsData = [];
  String _text = '';
  void _onVerticalSwipe(SwipeDirection direction) {
    setState(() {
      if (direction == SwipeDirection.up) {
        _text = 'Swiped up!';
        Get.snackbar('Swipe up', 'Swipe up',
            backgroundColor: Colors.pinkAccent);
      } else {
        _text = 'Swiped down!';
        Get.snackbar('Swipe DOWN', 'Swipe DOWN',
            backgroundColor: Colors.pinkAccent);
      }
    });
  }

  @override
  void initState() {
    super.initState();
    recentCommentsData = widget.receivedComments;
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        itemCount: recentCommentsData.length,
        itemBuilder: (BuildContext context, int index) {
          return Container(
            decoration: BoxDecoration(
                color: AppColors.FORM_GREY,
                borderRadius: BorderRadius.circular(15)),
            margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(vertical: 20, horizontal: 20),
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: () {
                          if (AppData.recentComments
                              .elementAt(index)['isExpanded']) {
                            AppData.recentComments
                                .elementAt(index)['isExpanded'] = false;
                          } else {
                            AppData.recentComments
                                .elementAt(index)['isExpanded'] = true;
                          }
                          setState(() {});
                        },
                        child: Align(
                          alignment: Alignment.topLeft,
                          child: Text(
                            recentCommentsData[index].commentExpanded
                                ? recentCommentsData[index].commentText
                                : recentCommentsData[index].commentText.length <
                                        220
                                    ? recentCommentsData[index].commentText
                                    : recentCommentsData[index]
                                            .commentText
                                            .substring(0, 220) +
                                        '  ...',
                            style: GoogleFonts.roboto(
                              color: Colors.black,
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 22,
                      ),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            ClipOval(
                                child: Image.network(
                              recentCommentsData[index].logo,
                              height: 60,
                              width: 60,
                              fit: BoxFit.cover,
                            )),
                            SizedBox(
                              width: 15,
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${recentCommentsData[index].firstName} ${recentCommentsData[index].lastName}',
                                  style: GoogleFonts.ropaSans(
                                      color: Colors.black,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w400),
                                ),
                                SizedBox(
                                  height: 3,
                                ),
                                Container(
                                  margin: EdgeInsets.only(top: 5),
                                  child: Text(
                                    simplyFormat(
                                        time: DateTime.parse(
                                            recentCommentsData[index]
                                                .createdDate),
                                        from: "comments"),
                                    style: GoogleFonts.roboto(
                                        color: AppColors.DARK_GREY,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ),
                              ],
                            ),
                            Spacer(),
                            recentCommentsData[index].likeType == 1
                                ? Container(
                                    child: Image(
                                      image: AssetImage(AppImages.HEART),
                                      height: 45,
                                      width: 45,
                                    ),
                                  )
                                : Container(
                                    height: 45,
                                    width: 45,
                                  ),
                            //Icon(Icons.favorite,color: Colors.red,size: 30,)FA
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        });
  }
}

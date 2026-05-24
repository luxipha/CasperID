import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_global_data.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/models/recentCommentsModel/RecentCommentsModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/utils/utils.dart';
import 'package:simple_gesture_detector/simple_gesture_detector.dart';
import 'package:swipe/swipe.dart';

import '../../../controllers/recentsCommentsController/RecentCommentsController.dart';
import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../models/user_data/user_model.dart';

class MyCommentsPage extends StatefulWidget {
  final List<RecentCommentsData> myRecentCommentsData;

  const MyCommentsPage({Key? key, required this.myRecentCommentsData})
      : super(key: key);

  @override
  _MyCommentsPageState createState() => _MyCommentsPageState();
}

class _MyCommentsPageState extends State<MyCommentsPage> with BaseClass {
  String _text = '';

  int pageNo = 1;
  List<RecentCommentsData> myRecentCommentsData = [];
  ScrollController _scrollController = new ScrollController();
  bool isLoading = false;
  bool noMoreItems = false;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final RecentCommentsController _recentCommentsController =
      Get.isRegistered<RecentCommentsController>()
          ? Get.find<RecentCommentsController>()
          : Get.put(RecentCommentsController());

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

    myRecentCommentsData = widget.myRecentCommentsData;
    setState(() {});
    setScrollListener();
    print("countsData ${myRecentCommentsData.length}");
  }

  @override
  Widget build(BuildContext context) {
    return myRecentCommentsData.length > 0
        ? Column(
            children: [
              ListView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  controller: _scrollController,
                  itemCount: myRecentCommentsData.length,
                  itemBuilder: (BuildContext context, int index) {
                    return Container(
                      width: MediaQuery.of(context).size.width,
                      padding: EdgeInsets.only(
                          top: 20, bottom: 20, left: 10, right: 10),
                      decoration: BoxDecoration(
                        color: AppColors.FORM_GREY,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      margin: EdgeInsets.all(15),
                      child: Column(
                        children: [
                          Row(
                            // mainAxisAlignment: MainAxisAlignment.start,
                            // crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipOval(
                                child: Image.network(
                                  myRecentCommentsData[index].logo ?? "",
                                  height: 65,
                                  width: 65,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          '${myRecentCommentsData[index].firstName} ${myRecentCommentsData[index].lastName}',
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.ropaSans(
                                              color: Colors.black,
                                              fontSize: 18,
                                              fontWeight: FontWeight.w400),
                                        ),
                                        myRecentCommentsData[index].likeType ==
                                                1
                                            ? Container(
                                                child: Image(
                                                  image: AssetImage(
                                                      AppImages.HEART),
                                                  height: 45,
                                                  width: 45,
                                                ),
                                              )
                                            : Container(
                                                height: 45,
                                                width: 45,
                                              ),
                                      ],
                                    ),
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Image(
                                                image: AssetImage(
                                                  AppImages.phone_blue,
                                                ),
                                                height: 16,
                                                width: 16,
                                                //  color: Colors.blue,
                                              ),
                                              SizedBox(
                                                width: 5,
                                              ),
                                              Expanded(
                                                child: Text(
                                                  " ${myRecentCommentsData[index].mobile}",
                                                  // maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: GoogleFonts.roboto(
                                                    color: AppColors.DARK_GREY,
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w400,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        SizedBox(
                                          width: 2,
                                        ),
                                        Expanded(
                                          child: Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Image(
                                                image: AssetImage(
                                                    AppImages.user_blue),
                                                height: 16,
                                                width: 16,
                                                fit: BoxFit.cover,
                                                //  color: Colors.blue,
                                              ),
                                              SizedBox(
                                                width: 5,
                                              ),
                                              Expanded(
                                                child: Text(
                                                  "${myRecentCommentsData[index].position}",
                                                  // maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: GoogleFonts.roboto(
                                                    color: AppColors.DARK_GREY,
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w400,
                                                  ),
                                                ),
                                              )
                                            ],
                                          ),
                                        )
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Padding(
                            padding: EdgeInsets.only(left: 8.0),
                            child: Align(
                              alignment: Alignment.topLeft,
                              child: GestureDetector(
                                onTap: () {
                                  if (myRecentCommentsData[index]
                                      .commentExpanded) {
                                    myRecentCommentsData[index].expandedValue =
                                        false;
                                  } else {
                                    myRecentCommentsData[index].expandedValue =
                                        true;
                                  }
                                  setState(() {});
                                },
                                child: Text(
                                  myRecentCommentsData[index].commentExpanded
                                      ? myRecentCommentsData[index].commentText
                                      : myRecentCommentsData[index]
                                                  .commentText
                                                  .length <
                                              220
                                          ? myRecentCommentsData[index]
                                              .commentText
                                          : myRecentCommentsData[index]
                                                  .commentText
                                                  .toString()
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
                          ),
                          Align(
                            alignment: Alignment.bottomRight,
                            child: Container(
                              margin: EdgeInsets.only(top: 5, right: 15),
                              child: Text(
                                simplyFormat(
                                    time: DateTime.parse(
                                        myRecentCommentsData[index]
                                            .createdDate),
                                    from: "comments"),
                                style: GoogleFonts.roboto(
                                    color: AppColors.DARK_GREY,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w400),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
              isLoading
                  ? Container(
                      height: 50,
                      width: 50,
                      margin: EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Image.asset(
                          'assets/gif_files/loader_transparent.gif',
                          height: 72,
                          width: 68,
                        ),
                      ))
                  : Container()
            ],
          )
        : Container();
  }

  void setScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
        if (_scrollController.position.pixels ==
            _scrollController.position.maxScrollExtent) {
          setState(() {});
          if (noMoreItems) {
            isLoading = false;
          } else {
            addMoreData();
            isLoading = true;
          }
        }
      }
    });
  }

  void addMoreData() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      pageNo = pageNo + 1;
      var model = await _recentCommentsController.getRecentComments(
          userDataModel.authToken.toString(), pageNo.toString(), "20");
      if (model.flag) {
        if (model.recentCommentsData.isEmpty) {
          noMoreItems = true;
          isLoading = false;
        } else {
          myRecentCommentsData.addAll(model.recentCommentsData);
          isLoading = false;
        }

        setState(() {});
      } else {
        throw model.message;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
  }
}

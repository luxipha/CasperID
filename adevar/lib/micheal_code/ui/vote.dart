import 'dart:math';

import 'package:dotted_line/dotted_line.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../Service/ApiModels/vote_idea_model.dart';
import '../core/provider/vote_idea_provider.dart';
import '../widgets/animation/sine_curve.dart';
import '../widgets/colors..dart';
import '../widgets/vote/count_down_bar.dart';
import 'share_idea.dart';

class Vote extends StatefulWidget {
  const Vote({Key? key}) : super(key: key);

  @override
  _VoteState createState() => _VoteState();
}

class _VoteState extends State<Vote> {
  final _shakeKey = GlobalKey<ShakeWidgetState>();

  String getCategoryName(int type) {
    if (type == 100011) {
      return 'Share Ideas';
    } else if (type == 100012) {
      return 'App Questions';
    } else if (type == 100013) {
      return 'Colors';
    } else if (type == 100012) {
      return 'QR Code';
    } else if (type == 100015) {
      return 'Portfolio';
    } else if (type == 100016) {
      return 'Settings';
    } else {
      print('Error getting category code');
      return 'Category';
    }
  }

  final List<Map<String, dynamic>> data = [
    {
      "profile": "assets/images/pic1.png",
      "like": "assets/images/like_svg.svg",
      "text1": "Calendar planning function",
      "text2": "1.5k",
      "color": "0xffe5f1fb"
    },
    {
      "profile": "assets/images/pic1.png",
      "like": "assets/images/like_svg.svg",
      "text1": "Calendar planning function ",
      "text2": "1.8k",
      "color": "0xffe8fbe5"
    },
    {
      "profile": "assets/images/pic1.png",
      "like": "assets/images/like_svg.svg",
      "text1": "Calendar planning function",
      "text2": "1.7k",
      "color": "0xfffbede5"
    },
  ];
  final List<Map<String, dynamic>> data2 = [
    {
      "profile": "assets/images/pic2.png",
      "like": "assets/images/like.png",
      "text1":
          "Calendar planning function Calendar planning function Calendar planning function",
      "text2": "2.5k",
      "color": "0xfff0e5fb"
    },
    {
      "profile": "assets/images/pic2.png",
      "like": "assets/images/like.png",
      "text1": "Calendar planning function",
      "text2": "3.5k",
      "color": "0xffe5f1fb"
    },
    {
      "profile": "assets/images/pic2.png",
      "like": "assets/images/like.png",
      "text1": "Calendar planning function",
      "text2": "1.8k",
      "color": "0xffe8fbe5"
    },
  ];
  Future<VoteIdeaModel?>? _futureVote;
  VoteIdeaModel? _ideaModel;

  ScrollController pageScrollController = ScrollController();

  @override
  void initState() {
    shake();
    super.initState();

    VoteIdeaProvider voteIdeaProvider =
        Provider.of<VoteIdeaProvider>(context, listen: false);

    voteIdeaProvider.scrollController.addListener(() async {
      if (voteIdeaProvider.scrollController.position.pixels >=
              voteIdeaProvider.scrollController.position.maxScrollExtent &&
          !voteIdeaProvider.isMoreLoading) {
        // Reload ListView with new data
        await voteIdeaProvider.getMoreIdeas(context).then(
          (value) {
            pageScrollController.animateTo(
              pageScrollController.position.minScrollExtent,
              duration: Duration(seconds: 1),
              curve: Curves.easeOut,
            );
          },
        );
        ;
        print('NEW IDEA CALL');
      }
    });
  }

  shake() {
    Future.delayed(Duration(milliseconds: 100), () {
      _shakeKey.currentState?.shake();
    });
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: InkWell(
          onTap: () {
            Navigator.pop(context);
          },
          child: Icon(
            Icons.arrow_back_ios,
            size: 25,
            color: Colors.black,
          ),
        ),
        title: Text(
          "Vote",
          style: TextStyle(
              fontSize: size.height * 0.025,
              fontWeight: FontWeight.bold,
              color: Colors.black),
        ),
        actions: [
          Padding(
            padding: EdgeInsets.only(right: size.width * 0.02),
            child: PopupMenuButton(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              icon: SvgPicture.asset(
                'assets/images/question_svg.svg',
                height: size.height * 0.028,
              ), //don't specify icon if you want 3 dot menu
              color: Colors.white,
              itemBuilder: (context) => [
                PopupMenuItem<int>(
                    value: 0,
                    child: Container(
                      height: size.height * 0.25,
                      width: size.width * 0.47,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20)),
                      child: Padding(
                        padding: EdgeInsets.only(
                          top: size.height * 0.02,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                SizedBox(
                                  width: size.width * 0.1,
                                ),
                                Center(
                                  child: Text(
                                    "Description",
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontWeight: FontWeight.bold,
                                        fontSize: size.height * 0.02),
                                  ),
                                ),
                                Spacer(),
                                Icon(
                                  Icons.close,
                                  color: Colors.grey,
                                  size: 25,
                                )
                              ],
                            ),
                            SizedBox(
                              height: size.height * 0.02,
                            ),
                            Text(
                              "1. The platform filters out",
                              style: TextStyle(
                                  fontSize: size.height * 0.017,
                                  color: Colors.black),
                            ),
                            Padding(
                              padding: EdgeInsets.only(left: size.width * 0.04),
                              child: Column(children: [
                                Text(
                                  "Suggestion or questions",
                                  style: TextStyle(
                                      fontSize: size.height * 0.017,
                                      color: Colors.black),
                                ),
                                Text(
                                  "from users on the list for consideration.",
                                  style: TextStyle(
                                      fontSize: size.height * 0.017,
                                      color: Colors.black),
                                ),
                              ]),
                            ),
                            SizedBox(height: size.height * 0.005),
                            Text(
                              "2. User in the top 10",
                              style: TextStyle(
                                  fontSize: size.height * 0.017,
                                  color: Colors.black),
                            ),
                            Padding(
                              padding:
                                  EdgeInsets.only(left: size.width * 0.045),
                              child: Text(
                                "receive points",
                                style: TextStyle(
                                    fontSize: size.height * 0.017,
                                    color: Colors.black),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )),
              ],
              onSelected: (item) => {print(item)},
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        backgroundColor: Colors.black,
        color: Colors.white,
        strokeWidth: 5,
        displacement: 100,
        edgeOffset: 20,
        triggerMode: RefreshIndicatorTriggerMode.anywhere,
        onRefresh: onRefresh,
        child: SizedBox(
          height: size.height,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Text(
                  "Start time 12:00, october 20, 2021",
                  style: TextStyle(
                      fontSize: size.height * 0.0135,
                      color: Colors.grey,
                      fontWeight: FontWeight.w700),
                ),
              ),
              Center(
                child: GestureDetector(
                  onTap: () => _shakeKey.currentState?.shake(),
                  child: Text(
                    "Countdown: 25 days",
                    style: TextStyle(
                        color: blueColor,
                        fontSize: size.height * 0.028,
                        fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              SizedBox(height: size.height * 0.01),
              Container(
                padding: EdgeInsets.only(right: 0),
                // width: size.width,
                // height: size.height * .8,
                // color: Colors.blue,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  controller: pageScrollController,
                  reverse: true,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        // width: size.width,
                        height: size.height * 0.04,
                        child: CountDownBar(),
                      ),
                      SizedBox(height: size.height * 0.02),
                      Container(
                        width: size.width * 2.2,
                        // color: Colors.purple,
                        child: Row(
                          // mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Padding(
                              padding:
                                  EdgeInsets.only(left: size.width * 0.035),
                              child: ShakeWidget(
                                // 4. pass the GlobalKey as an argument
                                key: _shakeKey,
                                // 5. configure the animation parameters
                                shakeCount: 2,
                                shakeOffset: 3,
                                shakeDuration: Duration(milliseconds: 800),
                                // 6. Add the child widget that will be animated
                                child: IntrinsicHeight(
                                  child: Stack(
                                    children: [
                                      Container(
                                        height: size.height * 0.7,
                                        width: size.width * 2 - 15,
                                        child: ListView.builder(
                                          itemCount: 4,
                                          physics:
                                              NeverScrollableScrollPhysics(),
                                          scrollDirection: Axis.horizontal,
                                          itemBuilder: (context, index) {
                                            return Container(
                                              width: size.width * 0.48,
                                              // color: Colors.purple,
                                              child: Align(
                                                alignment:
                                                    Alignment.centerRight,
                                                child: DottedLine(
                                                  dashLength: 10,
                                                  dashGapLength: 6,
                                                  lineThickness: 0.5,
                                                  dashColor: Color(0xff0A4ED9)
                                                      .withOpacity(0.2),
                                                  direction: Axis.vertical,
                                                  lineLength: size.height * .7,
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          FutureBuilder(
                                            future:
                                                Provider.of<VoteIdeaProvider>(
                                                        context,
                                                        listen: false)
                                                    .getIdea(context)
                                                    .then(
                                              (value) {
                                                pageScrollController.animateTo(
                                                  pageScrollController
                                                      .position.maxScrollExtent,
                                                  duration: Duration(
                                                      milliseconds: 1500),
                                                  curve: Curves.easeOut,
                                                );
                                              },
                                            ),
                                            builder: (context, snapshot) {
                                              // if (snapshot.hasData) {
                                              print("has data");
                                              return _showIdeaVotes(
                                                  size, context);
                                              // } else if (snapshot.hasError) {
                                              //   return Text(
                                              //       "Something went wrong");
                                              // } else {
                                              //   return CircularProgressIndicator();
                                              // }
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            // children: AnimationConfiguration.toStaggeredList(
            //   duration: const Duration(seconds: 1),
            //   childAnimationBuilder: (widget) => SlideAnimation(
            //     horizontalOffset: 00.0,
            //     verticalOffset: 00.0,
            //     child: FlipAnimation(
            //       child: widget,
            //     ),
            //   ),
            //
            // )
          ),
        ),
      ),
    );
  }

  Future<void> onRefresh() async {
    return Future.delayed(Duration(milliseconds: 400), () {
      _shakeKey.currentState?.shake();
    });
  }

  Widget _showIdeaVotes(Size size, BuildContext context) {
    return Consumer<VoteIdeaProvider>(
      builder: (context, VoteIdeaProvider voteIdeaProvider, _) {
        if (voteIdeaProvider.isLoading == true) {
          return Container(
            height: size.height / 2,
            width: size.width,
            child: Center(
              child: Lottie.asset('assets/animations/loading.json'),
            ),
          );
        } else {
          return Row(
            children: [
              Column(
                children: [
                  voteIdeaProvider.voteIdeaModel != null
                      ? Stack(
                          children: [
                            Container(
                              width: size.width * 2.2 - 15,
                              child: Row(
                                children: [
                                  Container(
                                    height: size.height * 0.7,
                                    width: size.width * 2.2 - 15,
                                    child: voteIdeaProvider
                                                    .voteIdeaModel!['items'] !=
                                                null &&
                                            voteIdeaProvider
                                                    .voteIdeaModel!['items']!
                                                    .length >
                                                0
                                        ? ListView.builder(
                                            // physics: NeverScrollableScrollPhysics(),
                                            scrollDirection: Axis.vertical,
                                            controller: voteIdeaProvider
                                                .scrollController,
                                            itemCount: voteIdeaProvider
                                                .voteIdeaModel!['items']!
                                                .length,
                                            itemBuilder: (context, index) {
                                              var currentItem = voteIdeaProvider
                                                      .voteIdeaModel!['items']![
                                                  index];

                                              return Row(
                                                children: [
                                                  /// This SizedBox determines the position of each
                                                  /// vote Card depending on the minLike and maxLike
                                                  Container(
                                                    width: voteIdeaProvider
                                                        .likeSpaces[index],
                                                    height: 20,
                                                    // color: Colors.purple,
                                                  ),
                                                  Padding(
                                                    padding: EdgeInsets.only(
                                                      top: size.height * 0.02,
                                                      // left: size.width * 0.04,
                                                      // right: index % 2 == 0
                                                      //     ? size.width * 0.04
                                                      //     : size.width * 0.0
                                                    ),
                                                    child: GestureDetector(
                                                      onTap: () =>
                                                          Navigator.push(
                                                        context,
                                                        MaterialPageRoute(
                                                          builder: (context) =>
                                                              ShareIdeas(
                                                            tabTitle:
                                                                getCategoryName(
                                                              voteIdeaProvider
                                                                          .voteIdeaModel![
                                                                      'items']![index]
                                                                  [
                                                                  'userIdeaView']['type'],
                                                            ),
                                                            id: voteIdeaProvider
                                                                        .voteIdeaModel![
                                                                    'items']![index]
                                                                [
                                                                'userIdeaView']['id'],
                                                            title: voteIdeaProvider
                                                                        .voteIdeaModel![
                                                                    'items']![index]
                                                                [
                                                                'userIdeaView']['title'],
                                                            comments: voteIdeaProvider
                                                                            .voteIdeaModel![
                                                                        'items']![index]
                                                                    [
                                                                    'commentCount'] ??
                                                                0,
                                                            baseUserView: voteIdeaProvider
                                                                        .voteIdeaModel![
                                                                    'items']![index]
                                                                [
                                                                'baseUserView'],
                                                          ),
                                                        ),
                                                      ),
                                                      child: Container(
                                                        // height: size.height * 0.18,
                                                        width:
                                                            size.width * 0.38,
                                                        decoration:
                                                            BoxDecoration(
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(15),
                                                          color: Color(
                                                            int.parse(
                                                              data2[index %
                                                                      data.length]
                                                                  ["color"],
                                                            ),
                                                          ),
                                                        ),
                                                        child: Padding(
                                                          padding:
                                                              EdgeInsets.all(
                                                                  size.height *
                                                                      0.02),
                                                          child: Column(
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .spaceBetween,
                                                            children: [
                                                              Row(
                                                                mainAxisAlignment:
                                                                    MainAxisAlignment
                                                                        .spaceBetween,
                                                                children: [
                                                                  CircleAvatar(
                                                                    backgroundColor:
                                                                        Colors
                                                                            .transparent,
                                                                    radius: 25,
                                                                    backgroundImage:
                                                                        NetworkImage(
                                                                      voteIdeaProvider.voteIdeaModel!['items']![index]['baseUserView']
                                                                              [
                                                                              'logo'] ??
                                                                          'https://w0.peakpx.com/wallpaper/673/485/HD-wallpaper-raven-crow-crow-dark-for-phone-glow-glowing-hasaka-iphone-xr-itachi-mangekyou-neon-neon-phone-phone-x-portrait-raven-red-red-glow-rock-sharingan-sky-triangle-neon.jpg',
                                                                      scale:
                                                                          0.7,
                                                                    ),
                                                                  ),
                                                                  Row(
                                                                    children: [
                                                                      SvgPicture
                                                                          .asset(
                                                                        'assets/images/like_svg.svg',
                                                                        height: size.height *
                                                                            0.02,
                                                                      ),
                                                                      SizedBox(
                                                                        width: size.width *
                                                                            0.02,
                                                                      ),
                                                                      Text(
                                                                        "${voteIdeaProvider.voteIdeaModel!['items']![index]['likeCount'] ?? '0'}",
                                                                        style:
                                                                            TextStyle(
                                                                          color:
                                                                              Colors.grey,
                                                                        ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ],
                                                              ),
                                                              SizedBox(
                                                                height:
                                                                    size.height *
                                                                        0.02,
                                                              ),
                                                              Text(
                                                                voteIdeaProvider
                                                                            .voteIdeaModel!['items']![index]
                                                                        [
                                                                        'userIdeaView']!['text'] ??
                                                                    '',
                                                                style:
                                                                    const TextStyle(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w400,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              );
                                            },
                                          )
                                        : Text("No votes found"),
                                  ),
                                ],
                              ),
                            ),
                            Visibility(
                              visible: voteIdeaProvider.isMoreLoading,
                              child: Positioned(
                                bottom: 40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        )
                      : Text("Something went wrong"),
                ],
              ),
            ],
          );
        }
      },
    );
  }

  void exitDialog() {
    var size = MediaQuery.of(context).size;
    showDialog(
      context: context,
      barrierDismissible: false, // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
            content: Container(
          height: size.height * 0.18,
          child: Column(
            children: [
              Container(
                  height: size.height * 0.06,
                  width: size.height * 0.06,
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: Color(0xff4BB543), width: size.width * 0.008)),
                  child: Center(
                    child: Icon(
                      Icons.check,
                      color: Color(0xff4BB543),
                      size: 35,
                    ),
                  )),
              SizedBox(
                height: size.height * 0.04,
              ),
              Text(
                "Vous avez mis a jour votre\nmot de passe avec succes",
                style: TextStyle(
                    fontSize: size.height * 0.022, color: Colors.black),
              )
            ],
          ),
        ));
      },
    );
  }
}

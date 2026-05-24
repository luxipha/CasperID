import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/reject_ideas_provider.dart';
import 'package:highfedilityadevar/micheal_code/widgets/colors..dart';

import 'loading_idea_card.dart';

class RejectIdeasSheet extends StatelessWidget {
  const RejectIdeasSheet({
    Key? key,
    required this.size,
  }) : super(key: key);

  final Size size;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: size.height * 0.56,
          width: size.width,
          decoration: const BoxDecoration(
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30), topRight: Radius.circular(30)),
              color: Colors.white),
          child: Padding(
            padding: EdgeInsets.only(top: 30),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Container(
                  //   height: size.height * 0.008,
                  //   width: size.width * 0.35,
                  //   decoration: BoxDecoration(
                  //       color: Color(0xffE3E3E3),
                  //       borderRadius: BorderRadius.circular(10)),
                  // ),
                  // SizedBox(
                  //   height: size.height * 0.04,
                  // ),
                  Text(
                    'Thanks for the suggestion ~',
                    style: TextStyle(
                        fontSize: size.height * 0.023, color: blueColor),
                  ),
                  Text('we are still thinking about it',
                      style: TextStyle(
                          fontSize: size.height * 0.021, color: blueColor)),
                  SizedBox(
                    height: size.height * 0.03,
                  ),
                  FutureBuilder(
                    future: Provider.of<RejectIdeasProvider>(context)
                        .getRejectIdeas(),
                    builder: (context, AsyncSnapshot snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return ListView.builder(
                          itemCount: 2,
                          shrinkWrap: true,
                          padding: EdgeInsets.symmetric(horizontal: 20),
                          itemBuilder: (context, index) {
                            return LoadingIdeaCard();
                          },
                        );
                      } else {
                        return Consumer<RejectIdeasProvider>(
                            builder: (context, rejectIdeasProvider, _) {
                          return ListView.builder(
                            shrinkWrap: true,
                            itemCount: rejectIdeasProvider
                                .rejectIdeas!['items'].length,
                            physics: NeverScrollableScrollPhysics(),
                            itemBuilder: (context, index) {
                              return Container(
                                padding: EdgeInsets.only(
                                    left: size.width * 0.03,
                                    right: size.width * 0.03),
                                margin: EdgeInsets.symmetric(
                                    vertical: 10, horizontal: 15),
                                alignment: Alignment.center,
                                height: size.height * 0.13,
                                width: size.width,
                                decoration: BoxDecoration(
                                    color: Color(0xfff0e5fb),
                                    borderRadius: BorderRadius.circular(
                                        size.height * 0.02)),
                                child: Row(
                                  children: [
                                    Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Container(
                                          height: size.height * 0.06,
                                          width: size.height * 0.06,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            image: DecorationImage(
                                              fit: BoxFit.cover,
                                              image: AssetImage(
                                                  'assets/images/khadija.png'),
                                            ),
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            SvgPicture.asset(
                                              'assets/images/star_svg.svg',
                                              height: size.height * 0.018,
                                            ),
                                            Text(
                                              '700',
                                              style: TextStyle(
                                                  color: Color(0xffD7AD05),
                                                  fontSize: size.height * 0.017,
                                                  fontWeight: FontWeight.w600),
                                            )
                                          ],
                                        )
                                      ],
                                    ),
                                    SizedBox(
                                      width: size.width * 0.03,
                                    ),
                                    Container(
                                      //alignment: Alignment.centerLeft,
                                      height: size.height * 0.12,
                                      width: size.width * 0.53,
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceEvenly,
                                        children: [
                                          Text(
                                            '1: Calendar Planning Function',
                                            style: TextStyle(
                                                fontSize: size.height * 0.017,
                                                fontWeight: FontWeight.w600),
                                          ),
                                          Text(
                                            '2: Video Intro',
                                            style: TextStyle(
                                                fontSize: size.height * 0.017,
                                                fontWeight: FontWeight.w600),
                                          ),
                                          Text(
                                            '3: Calendar Planning Function',
                                            style: TextStyle(
                                                fontSize: size.height * 0.017,
                                                fontWeight: FontWeight.w600),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: Container(
                                        height: size.height * 0.12,
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceEvenly,
                                          children: [
                                            Row(
                                              children: [
                                                SvgPicture.asset(
                                                  'assets/images/like_svg.svg',
                                                  height: size.height * 0.018,
                                                ),
                                                SizedBox(
                                                  width: size.width * 0.03,
                                                ),
                                                Text(
                                                  '2k',
                                                  style: TextStyle(
                                                      color: Color(0xff8E8E93),
                                                      fontSize:
                                                          size.height * 0.017),
                                                ),
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                SvgPicture.asset(
                                                  'assets/images/like_svg.svg',
                                                  height: size.height * 0.018,
                                                ),
                                                SizedBox(
                                                  width: size.width * 0.03,
                                                ),
                                                Text(
                                                  '2k',
                                                  style: TextStyle(
                                                      color: Color(0xff8E8E93),
                                                      fontSize:
                                                          size.height * 0.017),
                                                ),
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                SvgPicture.asset(
                                                  'assets/images/like_svg.svg',
                                                  height: size.height * 0.018,
                                                ),
                                                SizedBox(
                                                  width: size.width * 0.03,
                                                ),
                                                Text(
                                                  '2.5k',
                                                  style: TextStyle(
                                                      color: Color(0xff8E8E93),
                                                      fontSize:
                                                          size.height * 0.017),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                              );
                            },
                          );
                        });
                      }
                    },
                  )
                ],
              ),
            ),
          ),
        ),
        Container(
          height: 25,
          width: size.width,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: size.height * 0.008,
                width: size.width * 0.35,
                padding: EdgeInsets.only(top: 20),
                decoration: BoxDecoration(
                  color: Color(0xffE3E3E3),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

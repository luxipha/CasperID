import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';

class RatingCard extends StatelessWidget {
  final double height;
  final resumseInfoResponse;

  const RatingCard({
    Key? key,
    this.height = 100,
    this.resumseInfoResponse,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    int mark = 0;
    int mark1 = 0;
    int mark2 = 0;
    int mark3 = 0;
    //     ? resumseInfoResponse['data']['score'][0]['count']
    //     : 0;
    // int mark1 = resumseInfoResponse['data']['score'] != null &&
    //         resumseInfoResponse['data']['score'].length > 0
    //     ? resumseInfoResponse['data']['score'][1]['count']
    //     : 0;
    // int mark2 = resumseInfoResponse['data']['score'] != null &&
    //         resumseInfoResponse['data']['score'].length > 0
    //     ? resumseInfoResponse['data']['score'][2]['count']
    //     : 0;
    // int mark3 = resumseInfoResponse['data']['score'] != null &&
    //         resumseInfoResponse['data']['score'].length > 0
    //     ? resumseInfoResponse['data']['score'][3]['count']
    //     : 0;
    if (resumseInfoResponse['data']['score'] != null &&
        resumseInfoResponse['data']['score'].length > 0) {
      resumseInfoResponse['data']['score'].forEach((item) {
        if (item['vipLevel'] == 1) {
          mark = item['count'];
        }
        if (item['vipLevel'] == 2) {
          mark1 = item['count'];
        }
        if (item['vipLevel'] == 3) {
          mark2 = item['count'];
        }
        if (item['vipLevel'] == 4) {
          mark3 = item['count'];
        }
      });
    }

    // double avg = mark == 0 && mark1 == 0 && mark2 == 0 && mark3 == 0
    //     ? 0
    //     : (0 * mark + 2 * mark1 + 3 * mark2 + 4 * mark3) /
    //         (mark + mark1 + mark2 + mark3);

    return Container(
      margin: EdgeInsets.zero,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.FORM_GREY,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              // alignment: Alignment.center,
              // height: 115,
              // width: 120,
              padding: EdgeInsets.only(top: 15),
              // decoration: BoxDecoration(
              //   color: AppColors.FORM_GREY,
              //   borderRadius: BorderRadius.circular(15),
              // ),
              child: Center(
                child: SfRadialGauge(
                  animationDuration: 100,
                  axes: <RadialAxis>[
                    RadialAxis(
                      minimum: progressMinimumValue(
                          resumseInfoResponse['data']['rating']),
                      maximum: progressMaximumValue(
                          resumseInfoResponse['data']['rating']),
                      showLabels: false,
                      showTicks: false,
                      startAngle: 180,
                      endAngle: 0,
                      radiusFactor: 1,
                      ranges: [
                        GaugeRange(
                          startValue: 0,
                          endValue: double.parse(
                              resumseInfoResponse['data']['rating'].toString()),
                          startWidth: 8,
                          endWidth: 8,
                          color: progressBarColor(
                            resumseInfoResponse['data']['rating'],
                          ),
                        ),
                      ],
                      axisLineStyle: AxisLineStyle(
                        thickness: 8,
                        color: Color(0xffDFEBF4),
                        cornerStyle: CornerStyle.bothCurve,
                      ),
                      annotations: <GaugeAnnotation>[
                        GaugeAnnotation(
                          positionFactor: 0.10,
                          horizontalAlignment: GaugeAlignment.center,
                          verticalAlignment: GaugeAlignment.center,
                          widget: Center(
                            child: Container(
                              child: Image(
                                image: AssetImage(
                                  progressBarEmoji(
                                    resumseInfoResponse['data']['rating'],
                                  ),
                                ),
                                height: 60,
                                width: 60,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            // Container(
            //   child: Row(
            //     children: [
            //       SizedBox(
            //         width: 11,
            //       ),
            //       Expanded(
            //         child: Stack(
            //           fit: StackFit.expand,
            //           children: [
            //             Align(
            //               //alignment: Alignment.topCenter,
            //               child: Container(
            //                 margin: EdgeInsets.only(top: 10, bottom: 10),
            //                 child: Stack(
            //                   children: [
            //                     CircularPercentIndicator(
            //                       radius: 80,
            //                       percent: avg / 10,
            //                       progressColor: Colors.green,
            //                       circularStrokeCap: CircularStrokeCap.round,
            //                     )
            //                     /*Container(
            //                       child: Image(
            //                           image: AssetImage(AppImages.FULL_ARC)),
            //                     ),
            //                     Container(
            //                       child: Image(
            //                           image: AssetImage(AppImages.SEMI_ARC)),
            //                     ),*/
            //                   ],
            //                 ),
            //               ),
            //             ),
            //             Center(
            //               child: Container(
            //                 margin: EdgeInsets.only(top: 10, bottom: 10),
            //                 child: Image(
            //                   image: AssetImage(AppImages.SMILEY),
            //                   height: 47,
            //                   width: 47,
            //                 ),
            //               ),
            //             ),
            //           ],
            //         ),
            //       ),
            //       SizedBox(
            //         width: 11,
            //       ),
            //       // Expanded(
            //       //   child: Text(
            //       //     '${(avg).toStringAsFixed(1)}',
            //       //     maxLines: 1,
            //       //     textScaleFactor: 1,
            //       //     style: GoogleFonts.roboto(
            //       //         fontWeight: FontWeight.w700,
            //       //         fontSize: 28,
            //       //         color: Colors.black),
            //       //   ),
            //       // ),
            //     ],
            //   ),
            // ),
          ),
          Expanded(
            child: Container(
              child: Stack(
                children: [
                  Align(
                    alignment: Alignment.bottomLeft,
                    child: Container(
                      margin:
                          EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Row(
                          //   children: [
                          //     Text(
                          //       '5',
                          //       style: GoogleFonts.roboto(
                          //           fontWeight: FontWeight.w400,
                          //           fontSize: 12,
                          //           color: AppColors.BLACK),
                          //     ),
                          //     SizedBox(
                          //       width: 5,
                          //     ),
                          //     Expanded(
                          //       child: Container(
                          //         height: 5,
                          //         decoration: BoxDecoration(
                          //           color: Colors.blue,
                          //         ),
                          //       ),
                          //     ),
                          //     SizedBox(
                          //       width: 5,
                          //     ),
                          //     Text(
                          //       '5',
                          //       style: GoogleFonts.roboto(
                          //           fontWeight: FontWeight.w400,
                          //           fontSize: 12,
                          //           color: AppColors.BLACK),
                          //     ),
                          //   ],
                          // ),
                          Row(
                            children: [
                              Text(
                                '4',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: LinearPercentIndicator(
                                  lineHeight: 5.0,
                                  percent: mark3 / 10,
                                  backgroundColor: Colors.blue[100],
                                  progressColor: Colors.blue,
                                ),
                                // child: Container(
                                //   height: 5,
                                //   decoration: BoxDecoration(
                                //     color: Colors.blue.withOpacity(0.8),
                                //   ),
                                // ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '$mark3',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              // SizedBox(
                              //   width: 20,
                              // ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '3',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: LinearPercentIndicator(
                                  lineHeight: 5.0,
                                  percent: mark2 / 10,
                                  progressColor: Colors.blue,
                                  backgroundColor: Colors.blue[100],
                                ),
                                // child: Container(
                                //   height: 5,
                                //   decoration: BoxDecoration(
                                //     color: Colors.blue.withOpacity(0.7),
                                //   ),
                                // ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '$mark2',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              // SizedBox(
                              //   width: 10,
                              // ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '2',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: LinearPercentIndicator(
                                  lineHeight: 5.0,
                                  percent: mark1 / 10,
                                  backgroundColor: Colors.blue[100],
                                  progressColor: Colors.blue,
                                ),
                                // child: Container(
                                //   height: 5,
                                //   decoration: BoxDecoration(
                                //     color: Colors.blue.withOpacity(0.5),
                                //   ),
                                // ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '$mark1',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '1',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Expanded(
                                child: LinearPercentIndicator(
                                  lineHeight: 5.0,
                                  percent: mark / 10,
                                  progressColor: Colors.blue,
                                  backgroundColor: Colors.blue[100],
                                ),
                                // child: Container(
                                //   height: 5,
                                //   decoration: BoxDecoration(
                                //     color: Colors.blue.withOpacity(0.4),
                                //   ),
                                // ),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '$mark',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.BLACK),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  double progressMinimumValue(int value) {
    if (value >= 0 && value <= 149) {
      return 0;
    } else if (value >= 150 && value <= 349) {
      return 150;
    } else if (value >= 350 && value <= 549) {
      return 350;
    } else if (value >= 550 && value <= 1099) {
      return 550;
    } else if (value >= 1100 && value <= 3299) {
      return 1100;
    } else if (value >= 3300 && value <= 13199) {
      return 3300;
    } else if (value >= 13200 && value <= 65999) {
      return 13200;
    } else if (value >= 66000 && value <= 395999) {
      return 66000;
    } else if (value >= 396000 && value <= 2771999) {
      return 39600;
      // return ((value * 90) / 2771999);
    } else if (value >= 2772000 && value <= 22175999) {
      return 2772000;
    } else {
      return 2772000;
    }
  }

  double progressMaximumValue(int value) {
    if (value >= 0 && value <= 149) {
      return 149;
    } else if (value >= 150 && value <= 349) {
      return 349;
    } else if (value >= 350 && value <= 549) {
      return 549;
    } else if (value >= 550 && value <= 1099) {
      return 1099;
    } else if (value >= 1100 && value <= 3299) {
      return 3299;
    } else if (value >= 3300 && value <= 13199) {
      return 13199.0;
    } else if (value >= 13200 && value <= 65999) {
      return 65999;
    } else if (value >= 66000 && value <= 395999) {
      return 395999;
    } else if (value >= 396000 && value <= 2771999) {
      return 2771999;
    } else if (value >= 2772000 && value <= 22175999) {
      return 22175999;
    } else {
      return 22175999;
    }
  }

  Color progressBarColor(int value) {
    if (value >= 0 && value <= 149) {
      return Color(0xffAF0606);
    } else if (value >= 150 && value <= 349) {
      return Color(0xffD33429);
    } else if (value >= 350 && value <= 549) {
      return Color(0xffF1D022);
    } else if (value >= 550 && value <= 1099) {
      return Color(0xff3FD027);
    } else if (value >= 1100 && value <= 3299) {
      return Color(0xff04D2AD);
    } else if (value >= 3300 && value <= 13199) {
      return Color(0xff0085FF);
    } else if (value >= 13200 && value <= 65999) {
      return Color(0xff001AFF);
    } else if (value >= 66000 && value <= 395999) {
      return Color(0xffAD00FF);
    } else if (value >= 396000 && value <= 2771999) {
      return Color(0xffFF00A8);
    } else if (value >= 2772000 && value <= 22175999) {
      return Color(0xffF94B01);
    } else {
      return Color(0xffF94B01);
    }
  }

  String progressBarEmoji(int value) {
    if (value >= 0 && value <= 149) {
      return AppImages.EXP1;
    } else if (value >= 150 && value <= 349) {
      return AppImages.EXP2;
    } else if (value >= 350 && value <= 549) {
      return AppImages.EXP3;
    } else if (value >= 550 && value <= 1099) {
      return AppImages.EXP4;
    } else if (value >= 1100 && value <= 3299) {
      return AppImages.EXP5;
    } else if (value >= 3300 && value <= 13199) {
      return AppImages.EXP6;
    } else if (value >= 13200 && value <= 65999) {
      return AppImages.EXP7;
    } else if (value >= 66000 && value <= 395999) {
      return AppImages.EXP8;
    } else if (value >= 396000 && value <= 2771999) {
      return AppImages.EXP9;
    } else if (value >= 2772000 && value <= 22175999) {
      return AppImages.EXP10;
    } else {
      return AppImages.EXP10;
    }
  }
}

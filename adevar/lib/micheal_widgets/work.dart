import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:intl/intl.dart';

class Work extends StatelessWidget {
  final double height;
  final resumseInfoResponse;
  const Work({
    Key? key,
    required this.height,
    required this.resumseInfoResponse,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var now = new DateTime.now();
    var formatter = new DateFormat('yyyy-MM');
    String formatted = formatter.format(now);

    return resumseInfoResponse != null
        ? Card(
            // margin: EdgeInsets.only(left: 0,right: 1,bottom: 1,top: 1),
            margin: EdgeInsets.zero,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: Container(
              height: height,
              padding: EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: AppColors.FORM_GREY,
                borderRadius: BorderRadius.circular(15),
              ),
              width: double.infinity,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.work_outline,
                        size: 20,
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        'Work Experience',
                        style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontSize: 18,
                            fontWeight: FontWeight.w400),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Row(
                    children: [
                      Text(
                        '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? resumseInfoResponse['data']['work'][0]['companyName'] : ""}',
                        // 'linyi shengming timber co.ltd',
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.roboto(
                            fontWeight: FontWeight.w400,
                            fontSize: 12,
                            color: AppColors.DARK_GREY),
                      ),
                      Expanded(
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text(
                                // resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 && resumseInfoResponse['data']['edu'][0]['timePeriodEnd'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])) : null
                                '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? formatter.format(DateTime.parse(resumseInfoResponse['data']['work'][0]['workDataStart'])) : ""}',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.DARK_GREY),
                              ),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? formatter.format(DateTime.parse(resumseInfoResponse['data']['work'][0]['workDataEnd'])) : ""}',
                                style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 12,
                                    color: AppColors.DARK_GREY),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  Text(
                    '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? resumseInfoResponse['data']['work'][0]['workPosition'] : ""}',
                    //'UX designer',
                    style: GoogleFonts.roboto(
                      color: AppColors.BLACK_SHADE,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Text(
                    '${resumseInfoResponse['data']['work'] != null && resumseInfoResponse['data']['work'].length > 0 ? resumseInfoResponse['data']['work'][0]['workDescription'] : ""}',
                    // '1. Be responsible for the product interface design, analyze the user\'s operating habits and preferences, and propose the product interaction design and interface design scheme from the perspective of user experience;',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.roboto(
                      color: Colors.grey,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          )
        : CircularProgressIndicator();
  }
}

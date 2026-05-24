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

class Education extends StatelessWidget {
  final double height;
  final resumseInfoResponse;
  const Education({
    Key? key,
    this.height = 90,
    required this.resumseInfoResponse,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var formatter = new DateFormat('yyyy-MM');

    return resumseInfoResponse != null
        ? Card(
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
                      Image(
                        image: AssetImage(AppImages.EDU),
                        height: 20,
                        width: 20,
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        'Education',
                        style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontSize: 18,
                            fontWeight: FontWeight.w400),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 11,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 ? resumseInfoResponse['data']['edu'][0]['school'] : ""}',
                          //'Harvard University',
                          // maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              fontWeight: FontWeight.w400,
                              fontSize: 12,
                              color: AppColors.DARK_GREY),
                        ),
                      ),
                      SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        // flex: 2,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              '${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 ? resumseInfoResponse['data']['edu'][0]['timePeriodStar'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodStar'])) : formatter.format(DateTime.parse((resumseInfoResponse['data']['edu'][0]['timePeriodStar']).toString())) : ""}',
                              //'${DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd']).toLocal()}',
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.roboto(
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                  color: AppColors.DARK_GREY),
                            ),
                            SizedBox(
                              width: 5,
                            ),
                            Text(
                              '${resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 ? resumseInfoResponse['data']['edu'][0]['timePeriodEnd'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])) : formatter.format(DateTime.parse((resumseInfoResponse['data']['edu'][0]['timePeriodEnd']).toString())) : ""}',
                              //'${DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd']).toLocal()}',
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.roboto(
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                  color: AppColors.DARK_GREY),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          )
        : CircularProgressIndicator();
  }
}

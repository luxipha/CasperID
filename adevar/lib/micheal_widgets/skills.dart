import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';

class Skills extends StatelessWidget {
  final double height;
  final resumseInfoResponse;
  const Skills({
    Key? key,
    required this.height,
    required this.resumseInfoResponse,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var cindex = 0;
    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Container(
          height: height,
          padding: EdgeInsets.all(15),
          // margin: EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.FORM_GREY,
            borderRadius: BorderRadius.circular(15),
          ),
          width: double.infinity,
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(
              children: [
                Image(
                  image: AssetImage(AppImages.SKILLS),
                  height: 25,
                  width: 22,
                  color: Colors.black,
                ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  'Skills',
                  style: GoogleFonts.roboto(
                      color: Colors.black,
                      fontSize: 18,
                      fontWeight: FontWeight.w400),
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            resumseInfoResponse['data']['skills'] != null
                ? Container(
                    height: 120,
                    child: ListView.builder(
                        itemCount: resumseInfoResponse['data']['skills'].length,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (BuildContext context, int index) {
                          var colors = [
                            Colors.green,
                            Colors.purple,
                            Colors.orange,
                            Colors.blue
                          ];
                          var color = colors[cindex];
                          if (cindex == colors.length - 1) {
                            cindex = 0;
                          } else {
                            cindex = cindex + 1;
                          }
                          return Container(
                            height: 116,
                            width: 94,
                            margin: EdgeInsets.only(right: 20),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: color),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  height: 50,
                                  width: 48,
                                  margin: EdgeInsets.only(top: 15),
                                  decoration: BoxDecoration(
                                    color: color,
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  child: Center(
                                    child: Text(
                                      resumseInfoResponse['data']['skills']
                                                  [index]['chooseSkills'] !=
                                              null
                                          ? "${resumseInfoResponse['data']['skills'][index]['chooseSkills'][0]}"
                                          : "",
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.roboto(
                                        color: Colors.white,
                                        fontSize: 30,
                                        fontWeight: FontWeight.w400,
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  height: 12,
                                ),
                                Text(
                                  resumseInfoResponse['data']['skills'][index]
                                              ['chooseSkills'] !=
                                          null
                                      ? "${resumseInfoResponse['data']['skills'][index]['chooseSkills']}"
                                      : "",
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.roboto(
                                      color: Colors.black,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w400),
                                ),
                                SizedBox(
                                  height: 4,
                                ),
                                Text(
                                  resumseInfoResponse['data']['skills'][index]
                                              ['skillExperience'] !=
                                          null
                                      ? '${resumseInfoResponse['data']['skills'][index]['skillExperience']}'
                                      : "",
                                  style: GoogleFonts.roboto(
                                      color: AppColors.DARK_GREY,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w400),
                                ),
                              ],
                            ),
                          );
                        }),
                  )
                : CircularProgressIndicator()
          ])),
    );
  }
}

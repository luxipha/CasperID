import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:intl/intl.dart';

import '../consts/app_colors.dart';

class RecentComments extends StatelessWidget {
  final double height;
  final resumseInfoResponse;
  const RecentComments({
    Key? key,
    this.height = 140,
    required this.resumseInfoResponse,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var now = new DateTime.now();
    var formatter = new DateFormat('yyyy-MM-dd');
    String formatted = formatter.format(now);

    return resumseInfoResponse != null
        ? Card(
            margin: EdgeInsets.zero,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: Container(
              width: MediaQuery.of(context).size.width,
              height: height,
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.FORM_GREY,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.message_outlined,
                            size: 20,
                          ),
                          SizedBox(
                            width: 10,
                          ),
                          Text(
                            'Recent Comments',
                            style: TextStyle(
                              fontSize: 18,
                              // fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'More>',
                        style: TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Row(
                        children: [
                          Container(
                            // decoration: BoxDecoration(
                            //   border: Border.all(
                            //     width: 1,
                            //   ),
                            //   borderRadius:
                            //       BorderRadius.circular(50),
                            // ),
                            child: ClipRRect(
                                borderRadius: BorderRadius.circular(50),
                                child: resumseInfoResponse['data']['comment'] !=
                                            null &&
                                        resumseInfoResponse['data']['comment']
                                                    ['logo']
                                                .toString() !=
                                            ''
                                    ? Image.network(
                                        "${resumseInfoResponse['data']['comment']['logo']}",
                                        height: 25,
                                        fit: BoxFit.fill,
                                        width: 25,
                                      )
                                    : Container(
                                        height: 25,
                                        width: 25,
                                      )),
                          ),
                          // ClipRRect(
                          //   borderRadius: BorderRadius.circular(50),
                          //   child:resumseInfoResponse['data']['comment'] != null ? Image.network(
                          //     "${resumseInfoResponse['data']['comment']['logo']}",
                          //     height: 25,
                          //     width: 25,
                          //   ):Container(height: 25,width: 25,)
                          // ),
                          SizedBox(
                            width: 10,
                          ),
                          Text(
                            resumseInfoResponse['data']['comment'] != null &&
                                    resumseInfoResponse['data']['comment']
                                        .containsKey('firstName')
                                ? '${resumseInfoResponse['data']['comment']['firstName']}'
                                : "",
                            style: TextStyle(
                              fontSize: 18,
                              // fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        // resumseInfoResponse['data']['edu'] != null && resumseInfoResponse['data']['edu'].length > 0 && resumseInfoResponse['data']['edu'][0]['timePeriodEnd'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['edu'][0]['timePeriodEnd'])) : null
                        '${resumseInfoResponse['data']['comment'] != null && resumseInfoResponse['data']['comment'].length > 0 && resumseInfoResponse['data']['comment']['commentDateTime'].runtimeType == String ? formatter.format(DateTime.parse(resumseInfoResponse['data']['comment']['commentDateTime'])) : ""}',
                        //  '${DateTime.parse(resumseInfoResponse['data']['comment']['commentDateTime']).toLocal()}',
                        //'2021/12/14 16:02:44',
                        style: TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Container(
                    height: 50,
                    child: Text(
                      resumseInfoResponse['data']['comment'] != null &&
                              resumseInfoResponse['data']['comment']
                                  .containsKey('commentText')
                          ? "${resumseInfoResponse['data']['comment']['commentText']}"
                          : "",
                      //  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                      style: TextStyle(
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )
        : CircularProgressIndicator();
  }
}

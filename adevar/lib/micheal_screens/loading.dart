import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/controllers/about_software/about_software.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';

import 'package:percent_indicator/percent_indicator.dart';
import 'package:url_launcher/url_launcher.dart';

import '../micheal_config/colors.dart';
import '../micheal_config/strings.dart';
import '../models/setting/about_software_model.dart';

class LoadingScreen extends StatefulWidget {
  @override
  _LoadingScreenState createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> with BaseClass {
  AboutSoftwareController controller = AboutSoftwareController();
  AboutSoftwareModel? model;
  double percent = 1.0;
  @override
  void initState() {
    getSoftwareInfo();
    super.initState();
  }

  getSoftwareInfo() async {
    try {
      model = await controller.getSoftwareInfo();

      if (model!.flag!) {
        setState(() {});
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    String? _selected = 'm';
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Check For Updates'),
      ),
      body: model == null
          ? Center(
              child: CircularProgressIndicator(
              valueColor: new AlwaysStoppedAnimation<Color>(
                AppColors.red,
              ),
            ))
          : Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(
                  height: height / 15,
                ),
                Container(
                  height: height / 7,
                  width: 100,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      fit: BoxFit.contain,
                      image: AssetImage('assets/images/adevar_logo.png'),
                    ),
                  ),
                ),
                SizedBox(
                  height: height / 15,
                ),
                Text(
                  model != null
                      ? model!.data!.appVersionIntroduce!.title!
                      : functionUpdatesText,
                  style: TextStyle(
                      color: Colors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.bold),
                ),
                Padding(
                  padding: const EdgeInsets.all(15),
                  child: Container(
                    decoration: BoxDecoration(
                        color: fieldColor,
                        borderRadius: BorderRadius.circular(10)),
                    child: Padding(
                      padding: const EdgeInsets.all(15),
                      child: Column(
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: Icon(
                                  Icons.circle,
                                  color: Colors.blue,
                                  size: 10,
                                ),
                              ),
                              Flexible(
                                  child: Text(
                                model != null
                                    ? model!.data!.appVersionIntroduce!.body!
                                    : descText,
                                style: TextStyle(color: Colors.black),
                                maxLines: 3,
                              )),
                            ],
                          ),
                          // Padding(
                          //   padding: const EdgeInsets.only(top: 10, bottom: 10),
                          //   child: Row(
                          //     crossAxisAlignment: CrossAxisAlignment.start,
                          //     children: [
                          //       Padding(
                          //         padding: const EdgeInsets.only(right: 10),
                          //         child: Icon(
                          //           Icons.circle,
                          //           color: Colors.blue,
                          //           size: 10,
                          //         ),
                          //       ),
                          //       Flexible(
                          //           child: Text(
                          //         descText,
                          //         style: TextStyle(color: Colors.black),
                          //         maxLines: 3,
                          //       )),
                          //     ],
                          //   ),
                          // ),
                          // Row(
                          //   crossAxisAlignment: CrossAxisAlignment.start,
                          //   children: [
                          //     Padding(
                          //       padding: const EdgeInsets.only(right: 10),
                          //       child: Icon(
                          //         Icons.circle,
                          //         color: Colors.blue,
                          //         size: 10,
                          //       ),
                          //     ),
                          //     Flexible(
                          //         child: Text(
                          //       descText,
                          //       style: TextStyle(color: Colors.black),
                          //       maxLines: 3,
                          //     )),
                          //   ],
                          // ),
                          SizedBox(
                            height: height / 22,
                          )
                        ],
                      ),
                    ),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SizedBox(
                      width: width / 22,
                    ),
                    InkWell(
                      onTap: () {
                        launch(model!.data!.latestVersionUrl!);
                      },
                      child: Container(
                        margin: EdgeInsets.symmetric(vertical: 20),
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10)),
                        child: LinearPercentIndicator(
                          width: width / 1.3,
                          animation: true,
                          animationDuration: 1000,
                          lineHeight: height / 15,
                          percent: percent,
                          center: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                percent == 1.0 ? 'Update' : 'loading',
                                style: TextStyle(
                                  color: percent == 1.0
                                      ? Colors.white
                                      : Color(0xFF0078D4),
                                  fontSize: 15,
                                ),
                              ),
                              Text(
                                "20.0%",
                                style: TextStyle(
                                  color: Color(0xFF0078D4),
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                          linearStrokeCap: LinearStrokeCap.roundAll,
                          progressColor: Color(0xFF0078D4),
                          backgroundColor: Color(0xFF0078D4).withOpacity(0.2),
                        ),
                      ),
                    ),
                    SizedBox(
                      width: width / 22,
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}

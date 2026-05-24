import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/views/pages/public_qr_portfolio/public_qr_portfolio_page.dart';

import '../controllers/user_data/get_shared_pref.dart';

class PersonalDataSuccess extends StatelessWidget {
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Personal Data'),
      ),
      body: Column(
        // mainAxisAlignment: MainAxisAlignment.center,
        // crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height: 70,
          ),
          CircleAvatar(
            radius: 40,
            backgroundColor: Colors.green,
            child: Icon(
              Icons.check,
              size: 50,
              color: Colors.white,
            ),
          ),
          SizedBox(
            height: 20,
          ),
          Text(
            'Success',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(
            height: 20,
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.0),
            child: Text(
              'Your application has been submitted and is expected to be processed within 24 hours',
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            height: 20,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: InkWell(
              onTap: () async {
                /*showDialog(
                  context: context,
                  builder: (context) {
                    return BusinessCardDialog();
                  },
                );*/

                Navigator.of(context).pushReplacement(
                  new MaterialPageRoute(
                    builder: (context) => PublicQrPortfolioPage(
                        portfolioUrl: '',
                        userId: "0",
                        fromUpdateProfile: "updateProfile"),
                  ),
                );
              },
              child: Container(
                height: 50,
                width: MediaQuery.of(context).size.width,
                decoration: BoxDecoration(
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    'View Public',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

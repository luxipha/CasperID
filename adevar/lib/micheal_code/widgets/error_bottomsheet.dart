import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:highfedilityadevar/micheal_code/ui/adevar_forum.dart';
import 'package:highfedilityadevar/micheal_code/ui/share_idea.dart';

import 'colors..dart';

Widget errorBottomSheet(BuildContext context, String s) {
  var size = MediaQuery.of(context).size;
  return Container(
    height: size.height * 0.45,
    width: size.width,
    decoration: BoxDecoration(
        borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30), topRight: Radius.circular(30)),
        color: Colors.white),
    child: Padding(
      padding: EdgeInsets.only(
          left: size.width * 0.05,
          right: size.width * 0.05,
          top: size.height * 0.01),
      child: Column(
        children: [
          Container(
            height: size.height * 0.008,
            width: size.width * 0.35,
            decoration: BoxDecoration(
                color: Color(0xffE3E3E3),
                borderRadius: BorderRadius.circular(10)),
          ),
          SizedBox(
            height: size.height * 0.08,
          ),
          Container(
              height: size.height * 0.1,
              width: size.width * 0.2,
              child: SvgPicture.asset('assets/images/error_svg.svg')),
          SizedBox(
            height: size.height * 0.01,
          ),
          Text(
            "Error",
            style: TextStyle(color: Colors.black, fontSize: size.height * 0.02),
          ),
          SizedBox(
            height: size.height * 0.1,
          ),
          InkWell(
            onTap: () {
              print(s);
              // s==1?Navigator.pushReplacement(context, MaterialPageRoute(
              //     builder: (context)=>ShareIdeas()
              // )):Navigator.pushReplacement(context, MaterialPageRoute(
              //     builder: (context)=>AdevarForum()
              // ));
              // Get.offAll(ShareIdeas());
              Navigator.pop(context);
            },
            child: Container(
              height: size.height * 0.07,
              width: size.width,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15), color: blueColor),
              child: Center(
                child: Text(
                  "Retry",
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: size.height * 0.025),
                ),
              ),
            ),
          )
        ],
      ),
    ),
  );
}

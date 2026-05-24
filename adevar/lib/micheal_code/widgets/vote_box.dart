import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

Widget VoteBox(
  BuildContext context,
  String subtitle,
  String img,
  Color color,
  String title,
  String userno,
) {
  var size = MediaQuery.of(context).size;
  return Padding(
    padding: EdgeInsets.symmetric(horizontal: size.width * 0.01),
    child: Container(
      padding: EdgeInsets.all(size.height * 0.02),
      height: size.height * 0.21,
      width: size.height * 0.2,
      decoration: BoxDecoration(
          color: color,
          //border: Border.all(width: 1),
          borderRadius: BorderRadius.circular(25)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: size.height * 0.024),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                        color: Colors.white, fontSize: size.height * 0.02),
                  )
                ],
              ),
              SvgPicture.asset(img),
            ],
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                userno,
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: size.height * 0.05),
              ),
              Padding(
                padding: EdgeInsets.only(bottom: size.height * 0.007),
                child: Text(
                  'users',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: size.height * 0.02),
                ),
              ),
            ],
          )
        ],
      ),
    ),
  );
}

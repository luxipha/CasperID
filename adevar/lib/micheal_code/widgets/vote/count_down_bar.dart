import 'package:flutter/material.dart';

class CountDownBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.of(context).size;

    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          bottomLeft: Radius.circular(20),
        ),
        gradient: LinearGradient(
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
          colors: [
            Color(0xff96f1ff),
            Color(0xff0746d7),
          ],
        ),
      ),
      child: Padding(
        padding:
            EdgeInsets.only(left: size.width * 0.04, right: size.width * 0.0),
        child: Row(
          children: [
            Text(
              "1",
              style:
                  TextStyle(color: Colors.white, fontSize: size.height * 0.015),
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff71D6F9),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff6ED3F8),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff61C6F5),
              size: size.height * 0.02,
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Text(
              "5",
              style:
                  TextStyle(color: Colors.white, fontSize: size.height * 0.015),
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff71D6F9),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff6ED3F8),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff61C6F5),
              size: size.height * 0.02,
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Text(
              "10",
              style:
                  TextStyle(color: Colors.white, fontSize: size.height * 0.015),
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff71D6F9),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff6ED3F8),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff61C6F5),
              size: size.height * 0.02,
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Text(
              "20",
              style:
                  TextStyle(color: Colors.white, fontSize: size.height * 0.015),
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff267BE3),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff1E6FE0),
              size: size.height * 0.02,
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xff135DDC),
              size: size.height * 0.02,
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
            Text(
              "30",
              style:
                  TextStyle(color: Colors.white, fontSize: size.height * 0.015),
            ),
            SizedBox(
              width: size.width * 0.16,
            ),
          ],
        ),
      ),
    );
  }
}

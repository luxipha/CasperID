import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CardAndBlur extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      // color: Colors.purple,
      height: MediaQuery.of(context).size.height / 1.5,
      margin: EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            height: 200,
            width: MediaQuery.of(context).size.width,
            padding: EdgeInsets.symmetric(horizontal: 15, vertical: 20),
            decoration: BoxDecoration(
              color: Color(0xFFF8F8F8),
              borderRadius: BorderRadius.circular(15),
              image: DecorationImage(
                image: AssetImage('assets/images/card-background.png'),
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundImage: NetworkImage(
                            'https://picsum.photos/200/200?random=2',
                          ),
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Mary',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 30,
                              ),
                            ),
                            Text(
                              'ID：12345678',
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      height: 60,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            height: 30,
                            width: 65,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(7),
                              gradient: LinearGradient(
                                colors: [
                                  Color(0xFFFCE3C4),
                                  Color(0xFFE9BD86),
                                ],
                                stops: const [0.0, 1.0],
                                begin: FractionalOffset.centerLeft,
                                end: FractionalOffset.centerRight,
                                tileMode: TileMode.repeated,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                '个人版',
                                style: TextStyle(fontSize: 10),
                              ),
                            ),
                          ),
                          Text(
                            '注册日期：2020.12.08',
                            style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFFCCCCCC),
                            ),
                          ),
                        ],
                      ),
                    )
                  ],
                ),
                SizedBox(
                  height: 10,
                ),
                Row(
                  // mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.phone_android_outlined,
                              size: 20,
                              color: Colors.grey[700],
                            ),
                            SizedBox(
                              width: 5,
                            ),
                            Text('(704) 555-0127'),
                          ],
                        ),
                        SizedBox(
                          height: 10,
                        ),
                        Row(
                          children: [
                            Icon(
                              CupertinoIcons.profile_circled,
                              size: 20,
                              color: Colors.grey[700],
                            ),
                            SizedBox(
                              width: 5,
                            ),
                            Text('UX Designer'),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(
                      width: 40,
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.mail_outline,
                              size: 20,
                              color: Colors.grey[700],
                            ),
                            SizedBox(
                              width: 5,
                            ),
                            Text('Test@gmail.com'),
                          ],
                        ),
                        SizedBox(
                          height: 10,
                        ),
                        Row(
                          children: [
                            Icon(
                              CupertinoIcons.globe,
                              size: 20,
                              color: Colors.grey[700],
                            ),
                            SizedBox(
                              width: 5,
                            ),
                            Text('Henan.China'),
                          ],
                        ),
                      ],
                    ),
                  ],
                )
              ],
            ),
          ),
          SizedBox(
            height: 10,
          ),
          Container(
            height: 250,
            width: MediaQuery.of(context).size.width,
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            decoration: BoxDecoration(
              color: Color(0xFFF8F8F8),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Center(
              child: Container(
                height: 40,
                width: 140,
                decoration: BoxDecoration(
                  color: Color(0xFF0078D4),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Center(
                  child: Text(
                    'view more',
                    style: TextStyle(color: Colors.white),
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

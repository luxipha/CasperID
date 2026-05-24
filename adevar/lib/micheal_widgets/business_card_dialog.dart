import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class BusinessCardDialog extends StatelessWidget {
  const BusinessCardDialog({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 360,
          // width: MediaQuery.of(context).size.width / 1.1,
          decoration: BoxDecoration(
            color: Color(0xFF0078D4),
            borderRadius: BorderRadius.circular(15),
          ),
          padding: EdgeInsets.only(bottom: 30),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Material(
                    borderRadius: BorderRadius.circular(15),
                    child: Container(
                      height: 240,
                      width: MediaQuery.of(context).size.width / 1.2,
                      padding:
                          EdgeInsets.symmetric(vertical: 20, horizontal: 20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            height: 30,
                          ),
                          Center(
                            child: Text(
                              'Mary invites you to join adevar and make your own business card',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Color(0xFF0078D4),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                            height: 45,
                            padding: EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: Color(0xFF0078D4).withOpacity(0.08),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '+86',
                                  style: TextStyle(
                                    color: Color(0xFF0078D4),
                                    // fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(
                                  width: 5,
                                ),
                                Container(
                                  height: 40,
                                  width: MediaQuery.of(context).size.width / 2,
                                  // color: Colors.green,
                                  padding:
                                      EdgeInsets.symmetric(horizontal: 2.0),
                                  child: Center(
                                    child: TextField(
                                      decoration: InputDecoration.collapsed(
                                        hintText:
                                            'Please enter your phone number',
                                        hintStyle: TextStyle(
                                          fontSize: 12,
                                          overflow: TextOverflow.ellipsis,
                                          color: Color(0xFFB1B1B1),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Container(
                            height: 45,
                            decoration: BoxDecoration(
                              color: Color(0xFF0078D4),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                'Join Us',
                                style: TextStyle(
                                  color: Colors.white,
                                  // fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        Positioned(
          top: MediaQuery.of(context).size.height / 20,
          left: MediaQuery.of(context).size.width / 3,
          child: CircleAvatar(
            radius: 35,
            backgroundColor: Colors.green,
            backgroundImage: NetworkImage(
              'https://picsum.photos/200/200?random=2',
            ),
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ThemeScreen extends StatefulWidget {
  const ThemeScreen({Key? key}) : super(key: key);

  @override
  State<ThemeScreen> createState() => _ThemeScreenState();
}

class _ThemeScreenState extends State<ThemeScreen> {
  String selectedTheme = 'Light';
  bool mySwitch = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Theme',
          style: TextStyle(color: Colors.black),
        ),
        iconTheme: IconThemeData(
          color: Colors.black,
        ),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 70,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              GestureDetector(
                onTap: () {
                  setState(() {
                    selectedTheme = 'Light';
                  });
                  // showDialog(
                  //   context: context,
                  //   builder: (context) {
                  //     return Dialog(
                  //       backgroundColor: Colors.transparent,
                  //       child: BusinessCardDialog(),
                  //     );
                  //   },
                  // );
                },
                child: Column(
                  children: [
                    Stack(
                      children: [
                        Container(
                          height: 130,
                          width: 60,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: Colors.blue,
                            ),
                            image: DecorationImage(
                              image:
                                  AssetImage('assets/images/adevar-light.png'),
                            ),
                          ),
                        ),
                        Visibility(
                          visible: selectedTheme == 'Light',
                          child: Positioned(
                            top: 55,
                            left: 15,
                            child: CircleAvatar(
                              radius: 12,
                              backgroundColor: Color(0xff4ACE7F),
                              child: Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    Text(
                      'Light',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () {
                  setState(() {
                    selectedTheme = 'Dark';
                  });
                },
                child: Column(
                  children: [
                    Stack(
                      children: [
                        Container(
                          height: 130,
                          width: 60,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: Colors.black,
                            ),
                            image: DecorationImage(
                              image:
                                  AssetImage('assets/images/adevar-dark.png'),
                            ),
                          ),
                        ),
                        Visibility(
                          visible: selectedTheme == 'Dark',
                          child: Positioned(
                            top: 55,
                            left: 15,
                            child: CircleAvatar(
                              radius: 12,
                              backgroundColor: Color(0xff4ACE7F),
                              child: Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                      height: 20,
                    ),
                    Text(
                      'Dark',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(
            height: 30,
          ),
          Divider(
            thickness: 2,
            indent: 20,
            endIndent: 20,
          ),
          SizedBox(
            height: 10,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Row(
              children: [
                Container(
                  width: MediaQuery.of(context).size.width / 1.4,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Automatic',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Text(
                        'Adevar will switch dark mode on/off to match your system settings',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                    ],
                  ),
                ),
                CupertinoSwitch(
                  value: mySwitch,
                  activeColor: Colors.blue,
                  onChanged: (newValue) {
                    setState(() {
                      mySwitch = newValue;
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

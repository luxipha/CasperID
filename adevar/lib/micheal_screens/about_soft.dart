import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:highfedilityadevar/micheal_screens/privacy_policy.dart';
import 'package:highfedilityadevar/micheal_screens/user_agreement.dart';

import '../micheal_config/strings.dart';
import 'loading.dart';

class AboutSoft extends StatefulWidget {
  String? version;
  AboutSoft({Key? key, this.version}) : super(key: key);
  @override
  _AboutSoftState createState() => _AboutSoftState();
}

class _AboutSoftState extends State<AboutSoft> {
  @override
  Widget build(BuildContext context) {
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          aboutSoftText,
          style: TextStyle(fontSize: 20, color: Colors.white),
        ),
      ),
      backgroundColor: Colors.white,
      body: Column(
        children: [
          SizedBox(
            height: height / 15,
          ),
          Column(
            children: [
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
              Padding(
                padding: const EdgeInsets.only(top: 10, bottom: 5),
                child: Text(
                  adevarText,
                  style: TextStyle(color: Colors.black87, fontSize: 17),
                ),
              ),
              Text(
                'V${widget.version != null ? widget.version : "V1.0"}',
                style: TextStyle(color: Colors.black26),
              ),
              SizedBox(
                height: height / 15,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return PrivacyPolicy(
                                version: widget.version != null
                                    ? widget.version
                                    : "1.0.2",
                              );
                            },
                          ),
                        );
                      },
                      child: SizedBox(
                        child: Column(
                          children: [
                            SizedBox(
                              height: 20,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  privacyPolicyText,
                                  style: TextStyle(
                                      color: Colors.black87, fontSize: 17),
                                ),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  color: Colors.black87,
                                  size: 20,
                                ),
                              ],
                            ),
                            SizedBox(
                              height: height / 50,
                            ),
                          ],
                        ),
                      ),
                    ),
                    Divider(
                      height: height / 90,
                      color: Colors.grey.withOpacity(0.7),
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return UserAgreement(
                                version: widget.version,
                              );
                            },
                          ),
                        );
                      },
                      child: SizedBox(
                        child: Column(
                          children: [
                            SizedBox(
                              height: height / 50,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  userAgrementText,
                                  style: TextStyle(
                                      color: Colors.black87, fontSize: 17),
                                ),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  color: Colors.black87,
                                  size: 20,
                                ),
                              ],
                            ),
                            SizedBox(
                              height: height / 50,
                            ),
                          ],
                        ),
                      ),
                    ),
                    Divider(
                      height: height / 90,
                      color: Colors.grey.withOpacity(0.7),
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return LoadingScreen();
                            },
                          ),
                        );
                      },
                      child: SizedBox(
                        child: Column(
                          children: [
                            SizedBox(
                              height: height / 50,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  checkUpdatesText,
                                  style: TextStyle(
                                      color: Colors.black87, fontSize: 17),
                                ),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  color: Colors.black87,
                                  size: 20,
                                ),
                              ],
                            ),
                            SizedBox(
                              height: height / 50,
                            ),
                          ],
                        ),
                      ),
                    ),
                    Divider(
                      height: height / 90,
                      color: Colors.grey.withOpacity(0.7),
                    )
                  ],
                ),
              )
            ],
          ),
        ],
      ),
    );
  }
}

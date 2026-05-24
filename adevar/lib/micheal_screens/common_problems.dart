import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';


import '../micheal_config/colors.dart';
import '../micheal_config/strings.dart';

class CommonProblems extends StatefulWidget {
  @override
  _CommonProblemsState createState() => _CommonProblemsState();
}

class _CommonProblemsState extends State<CommonProblems> {
  @override
  Widget build(BuildContext context) {
    String? _selected = 'm';
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        title: Text(
          helpText,
          style: TextStyle(fontSize: 19, color: Colors.black),
        ),
      ),
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10), color: fieldColor),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 10),
                            child: Container(
                              height: height / 20,
                              width: width / 10,
                              child: Center(child: Text('?')),
                              decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      width: 1, color: Colors.black)),
                            ),
                          ),
                          Flexible(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  logTextOne,
                                  style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold),
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Text(
                                    logTextTwo,
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Text(
                                  descText,
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: height / 45,
                      ),
                      Row(
                        children: [
                          Container(
                              height: height / 20,
                              width: width / 10,
                              child: Icon(
                                Icons.message,
                                size: 25,
                                color: Colors.blue,
                              )),
                          Flexible(
                            child: Container(
                                width: width,
                                child: Center(
                                    child: Text(
                                  descTexttwo,
                                  style: TextStyle(
                                    color: Colors.lightBlueAccent,
                                    fontSize: 12,
                                  ),
                                  maxLines: 2,
                                ))),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(
                height: height / 35,
              ),
              Container(
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10), color: fieldColor),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 10),
                            child: Container(
                              height: height / 20,
                              width: width / 10,
                              child: Center(child: Text('?')),
                              decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      width: 1, color: Colors.black)),
                            ),
                          ),
                          Flexible(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  logTextOne,
                                  style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold),
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Text(
                                    logTextTwo,
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Text(
                                  descText,
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: height / 45,
                      ),
                      Row(
                        children: [
                          Container(
                              height: height / 20,
                              width: width / 10,
                              child: Icon(
                                Icons.message,
                                size: 25,
                                color: Colors.blue,
                              )),
                          Flexible(
                            child: Container(
                                width: width,
                                child: Center(
                                    child: Text(
                                  descTexttwo,
                                  style: TextStyle(
                                    color: Colors.lightBlueAccent,
                                    fontSize: 12,
                                  ),
                                  maxLines: 2,
                                ))),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

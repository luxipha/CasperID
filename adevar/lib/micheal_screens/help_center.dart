import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';


import '../micheal_config/colors.dart';
import '../micheal_config/strings.dart';

class HelpCenter extends StatefulWidget {
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<HelpCenter> {
  void onSelected(BuildContext context, int item) {
    switch (item) {
      case 0:
        print('===> My Submission');
        break;
      case 1:
        print('===> Common problem');
        break;
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
        elevation: 0,
        backgroundColor: Colors.white,
        title: Text(
          helpText,
          style: TextStyle(fontSize: 19, color: Colors.black),
        ),
        iconTheme: IconThemeData(
          color: Colors.black,
        ),
        actions: [
          // IconButton(
          //   onPressed: () {},
          //   icon: Icon(Icons.more_horiz),
          // ),
          // DropdownButton<String>(
          //   items: <String>['A', 'B', 'C', 'D'].map((String value) {
          //     return DropdownMenuItem<String>(
          //       value: value,
          //       child: Text(value),
          //     );
          //   }).toList(),
          //   onChanged: (_) {},
          // ),
          PopupMenuButton<int>(
            onSelected: (item) => onSelected(context, item),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            itemBuilder: (context) {
              return [
                PopupMenuItem(
                  value: 0,
                  child: Text('My Submission'),
                ),
                PopupMenuItem(
                  value: 1,
                  child: Text('Common problem'),
                ),
              ];
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            SizedBox(
              height: height / 35,
            ),
            // DropdownButton<String>(
            //   items: <String>['A', 'B', 'C', 'D'].map((String value) {
            //     return DropdownMenuItem<String>(
            //       value: value,
            //       child: Text(value),
            //     );
            //   }).toList(),
            //   onChanged: (_) {},
            // ),
            Text(
              helpCeterText,
              style: TextStyle(
                fontSize: 28,
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(
              height: height / 35,
            ),
            Text(
              descriptionText,
              style: TextStyle(
                fontSize: 14,
                color: Colors.black.withOpacity(0.5),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 2, bottom: 2),
              child: Text(
                staffText,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.black.withOpacity(0.5),
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.watch_later_outlined,
                  size: 15,
                ),
                Text(
                  hoursText,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.black.withOpacity(0.5),
                  ),
                ),
              ],
            ),
            SizedBox(
              height: height / 35,
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                    padding: const EdgeInsets.only(top: 10, bottom: 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.star,
                          size: 8,
                          color: Colors.red,
                        ),
                        Text(
                          titleText,
                          style: TextStyle(fontSize: 17, color: Colors.black),
                        ),
                      ],
                    )),
                Container(
                  width: width,
                  child: TextField(
                    autofocus: false,
                    style: TextStyle(
                      fontSize: 16.0,
                    ),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: fieldColor,
                      hintStyle: TextStyle(color: Colors.grey.withOpacity(0.5)),
                      hintText: titleText,
                      contentPadding: const EdgeInsets.only(
                          left: 14.0, bottom: 22.0, top: 22.0),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.white),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Colors.white),
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 10, bottom: 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.star,
                        size: 8,
                        color: Colors.red,
                      ),
                      Text(
                        messageText,
                        style: TextStyle(fontSize: 17, color: Colors.black),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: width,
                  child: TextField(
                    autofocus: false,
                    style: TextStyle(
                      fontSize: 16.0,
                    ),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: fieldColor,
                      hintStyle: TextStyle(color: Colors.grey.withOpacity(0.5)),
                      hintText: messageText,
                      contentPadding: const EdgeInsets.only(
                          left: 14.0, bottom: 22.0, top: 22.0),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.white),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Colors.white),
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(
              height: height / 5,
            ),
            Container(
              height: 50,
              width: width / 1.1,
              child: ElevatedButton(
                  child: Text(submitText,
                      style: TextStyle(
                        fontSize: 20,
                      )),
                  style: ButtonStyle(
                      foregroundColor:
                          MaterialStateProperty.all<Color>(Colors.white),
                      backgroundColor:
                          MaterialStateProperty.all<Color>(Color(0xFF0078D4)),
                      shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ))),
                  onPressed: () => {}),
            ),
          ],
        ),
      ),
    );
  }
}

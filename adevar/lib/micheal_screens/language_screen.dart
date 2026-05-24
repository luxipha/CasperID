import 'package:flutter/material.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({Key? key}) : super(key: key);

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  List<String> languages = ['Chinese', 'English'];
  String selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Language',  style: TextStyle(color: Colors.black),),
      ),
      body: ListView.builder(
        itemCount: languages.length,
        itemBuilder: (context, index) {
          return LanguageCard(
            language: languages[index],
            color: selectedLanguage == languages[index]
                ? Color(0xFF0078D4).withOpacity(0.1)
                : null,
            circleColor: selectedLanguage == languages[index]
                ? Colors.blue[800]
                : Colors.white,
            onTap: () {
              setState(() {
                selectedLanguage = languages[index];
              });
            },
          );
        },
      ),
    );
  }
}

class LanguageCard extends StatelessWidget {
  final VoidCallback? onTap;
  final String language;
  final Color? color;
  final Color? circleColor;

  const LanguageCard({
    Key? key,
    required this.onTap,
    required this.language,
    required this.color,
    required this.circleColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(left: 15, right: 15, top: 10),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 11,
                  backgroundColor: Colors.grey[400],
                  child: CircleAvatar(
                    radius: 9,
                    backgroundColor: Colors.white,
                    child: CircleAvatar(
                      radius: 7,
                      backgroundColor: circleColor,
                    ),
                  ),
                ),
                SizedBox(
                  width: 15,
                ),
                Container(
                  height: 40,
                  width: MediaQuery.of(context).size.width / 1.5,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    // crossAxisAlignment: CrossAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                      ),
                      Text(language),
                    ],
                  ),
                ),
              ],
            ),
            Divider(
              indent: 50,
              endIndent: 55,
            ),
          ],
        ),
      ),
    );
  }
}

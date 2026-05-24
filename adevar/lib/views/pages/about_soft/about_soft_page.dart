import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AboutSoftPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'About Soft',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: Container(),
    );
  }
}

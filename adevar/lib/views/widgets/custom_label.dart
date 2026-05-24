import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CustomLabel extends StatelessWidget {
  final String label;

  final Color labelColor;
  final FontWeight labelWeight;
  final TextAlign textAlign;

  final double labelSize;

  CustomLabel({
    required this.label,
    this.labelColor = Colors.white,
    this.labelWeight = FontWeight.w700,
    this.labelSize = 14,
    this.textAlign = TextAlign.center,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      textAlign: textAlign,
      style: GoogleFonts.poppins(
        textStyle: TextStyle(
          color: labelColor,
          fontWeight: labelWeight,
          fontSize: labelSize,
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ButtonWithImage extends StatelessWidget {
  final double height;
  final Color color;
  final String? text;
  final Color? textColor;
  final FontWeight textFontWeight;
  final double textFontSize;
  final Function onPressed;
  final double buttonRadius;
  final double leftMargin;
  final double rightMargin;
  final double topMargin;
  final double bottomMargin;
  final BuildContext context;
  final double buttonElevation;
  final Color borderColor;
  final Widget prefixIcon;

  ButtonWithImage(
      {required this.height,
      required this.color,
      required this.text,
      this.textColor,
      this.textFontWeight = FontWeight.w500,
      required this.textFontSize,
      required this.onPressed,
      this.buttonRadius = 0,
      this.leftMargin = 0,
      this.rightMargin = 0,
      this.topMargin = 0,
      this.bottomMargin = 0,
      this.buttonElevation = 0,
      this.borderColor = Colors.transparent,
      required this.prefixIcon,
      required this.context})
      : assert(
          text != null,
          'A non-null String must be provided to a Text widget.',
        );

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        onPressed(context);
      },
      child: Container(
        width: double.infinity,
        height: height,
        margin: EdgeInsets.only(
            left: leftMargin,
            right: rightMargin,
            top: topMargin,
            bottom: bottomMargin),
        decoration: BoxDecoration(
          border: Border.all(color: borderColor),
          color: color,
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            prefixIcon,
            SizedBox(width: 8,),
            Text(text!,
                style: GoogleFonts.poppins(
                  textStyle: TextStyle(
                    color: textColor,
                    fontWeight: textFontWeight,
                    fontSize: textFontSize,
                  ),
                )),
          ],
        )

        /*ElevatedButton(
          child: Text(text!,
              style: GoogleFonts.poppins(
                textStyle: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.w500,
                  fontSize: textFontSize,
                ),
              )),
          onPressed: () {
            onPressed(context);
          },
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(buttonRadius),
            ),
            primary: color,
          ),
        )*/
        ,
      ),
    );
  }
}

import 'package:flutter/material.dart';

class SlideToLock extends StatelessWidget {
  final double? height;
  final Widget? child;
  final Function? dismis;

  SlideToLock({Key? key, this.height, this.child, this.dismis})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    GlobalKey globalKey = GlobalKey();
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Stack(
        children: [
          child!,
          Dismissible(
            // background: Container(
            //   height: height,
            //   width: MediaQuery.of(context).size.width,
            //   decoration: BoxDecoration(
            //     borderRadius: BorderRadius.circular(15),
            //     color: Color(0xFF26C565).withOpacity(0.95),
            //   ),
            // ),
            // secondaryBackground: Container(
            //   width: MediaQuery.of(context).size.width,
            //   decoration: BoxDecoration(
            //     borderRadius: BorderRadius.circular(15),
            //     color: Color(0xFF26C565).withOpacity(0.95),
            //   ),
            //   height: height,
            // ),
            onDismissed: (Value) {
              dismis!();

              print("Value $Value");
            },
            key: globalKey,
            direction: DismissDirection.startToEnd,
            child: Container(
              width: 20, //  ,
              height: height,

              // padding: EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                // color: Colors.green.withOpacity(0.98),
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF26C565).withOpacity(0.95),
                    Color(0xFF26C565),
                  ],
                  stops: const [0.0, 1.0],
                  begin: FractionalOffset.centerLeft,
                  end: FractionalOffset.centerRight,
                  tileMode: TileMode.repeated,
                ),
                borderRadius: BorderRadius.circular(15),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

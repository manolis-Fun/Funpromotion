<?php

// change the total price and total print price based on the quantity entered
add_action( 'woocommerce_after_single_variation', 'change_total_price_and_total_print_price_by_quantity', 99 );
function change_total_price_and_total_print_price_by_quantity() {

    // only on the product page
    if ( ! is_product() ) {
        return;
    }

    global $product;
    
    // initializes the array that will contain the product data
    $product_data = array();

    // do divs need to be shown?
    $show = true;

    // gets the currency
    $currency = get_woocommerce_currency_symbol();

    // if the product is simple
    //if ( $product->is_type( 'simple' ) ) {
        // set the type of product
        //$product_data['type']  = 'simple';
        // get simple product data
        //$price_print_setup = get_post_meta( $variation_id , '_price_print_setup', true );
        //$product_data['price'] = $product->get_price();
        //$product_data['currency'] = $currency;
        //$product_data['price_print_setup'] = $price_print_setup;
    //}

    // if the product is variable
    if ( $product->is_type( 'variable' ) ) {

        $product_id = $product->get_id();
	    $price_main = get_field('_price_main', $product_id);
		$encoded_price = base64_encode($price_main);

        // set the type of product
        $product_data['type']  = 'variable';
        // get the ids of the product variations
        $variation_ids = $product->get_children();
        foreach ( $variation_ids as $variation_id ) {
            // gets the object of the variation product
            $variation = wc_get_product( $variation_id );
            // gets product variation data
            $price_print_1_3 = get_post_meta( $variation_id , '_price_print_1_3', true );
            $price_print_3_5 = get_post_meta( $variation_id , '_price_print_3_5', true );
            $price_print_5_10 = get_post_meta( $variation_id , '_price_print_5_10', true );
            $price_print_10_25 = get_post_meta( $variation_id , '_price_print_10_25', true );
            $price_print_25_50 = get_post_meta( $variation_id , '_price_print_25_50', true );
            $price_print_50_100 = get_post_meta( $variation_id , '_price_print_50_100', true );
            $price_print_100_250 = get_post_meta( $variation_id , '_price_print_100_250', true );
            $price_print_250_500 = get_post_meta( $variation_id , '_price_print_250_500', true );
            $price_print_500_1000 = get_post_meta( $variation_id , '_price_print_500_1000', true );
            $price_print_1000_2500 = get_post_meta( $variation_id , '_price_print_1000_2500', true );
            $price_print_2500_5000 = get_post_meta( $variation_id , '_price_print_2500_5000', true );
            $price_print_5000_10000 = get_post_meta( $variation_id , '_price_print_5000_10000', true );
            $price_print_10000_infinity = get_post_meta( $variation_id , '_price_print_10000_infinity', true );
            $price_print_setup = get_post_meta( $variation_id , '_price_print_setup', true );

            $price_print_100_250_customer = get_post_meta( $variation_id , '_price_print_100_250_customer', true );

            $max_printing_size = get_post_meta( $variation_id , '_max_printing_size', true );
            $printing_technique_field = get_post_meta( $variation_id , '_printing_technique_field', true );
            $product_data['variation'][$variation_id]['currency'] = $currency;

            $product_data['variation'][$variation_id]['price_print_1_3'] = $price_print_1_3;
            $product_data['variation'][$variation_id]['price_print_3_5'] = $price_print_3_5;
            $product_data['variation'][$variation_id]['price_print_5_10'] = $price_print_5_10;
            $product_data['variation'][$variation_id]['price_print_10_25'] = $price_print_10_25;
            $product_data['variation'][$variation_id]['price_print_25_50'] = $price_print_25_50;
            $product_data['variation'][$variation_id]['price_print_50_100'] = $price_print_50_100;
            $product_data['variation'][$variation_id]['price_print_100_250'] = $price_print_100_250;
            $product_data['variation'][$variation_id]['price_print_250_500'] = $price_print_250_500;
            $product_data['variation'][$variation_id]['price_print_500_1000'] = $price_print_500_1000;
            $product_data['variation'][$variation_id]['price_print_1000_2500'] = $price_print_1000_2500;
            $product_data['variation'][$variation_id]['price_print_2500_5000'] = $price_print_2500_5000;
            $product_data['variation'][$variation_id]['price_print_5000_10000'] = $price_print_5000_10000;
            $product_data['variation'][$variation_id]['price_print_10000_infinity'] = $price_print_10000_infinity;
            $product_data['variation'][$variation_id]['price_print_setup'] = $price_print_setup;

            $product_data['variation'][$variation_id]['price_print_100_250_customer'] = $price_print_100_250_customer;

            $product_data['variation'][$variation_id]['max_printing_size'] = $max_printing_size;
            $product_data['variation'][$variation_id]['printing_technique_field'] = $printing_technique_field;
        }

        // HIDES THE DIV
        $show = false;
    }
    
    // returns the JSON representation of a data
    $product_data_json = json_encode( $product_data );
    $encoded_product_data_json = base64_encode($product_data_json);

    // create the divs that will contain the total price and total print price

    //Open section that contains info (works for both admin and customer)
    echo sprintf(
        '<section id="sectionInfoElement" style="display:none;">'
    );

        //Open inner section that contains prices (works for both admin and customer)
        echo sprintf(
            '<section id="pricesInfoElement" style="display:none;">'
        );

            //Κόστος ανά προϊόν (works for both admin and customer)
            echo sprintf(
                '<div id="price_per_product_price" style="display:none;">%s %s</div>',__('<img src="https://funpromotion.gr/wp-content/uploads/2023/10/price_per-icon.png" style="margin-right:8px;margin-top: -3px;"><strong style="">Τιμή / τμχ.: </strong>','woocommerce'),'<span class="price_per_product" style="font-weight: 700;margin-left: 5px;color: #f70;font-size: 17px;"></span>'
            );

            if (current_user_can('administrator')) {
                //Κόστος ανά προϊόν πελάτη (works for admin )
                echo sprintf(
                    '<div id="price_per_product_price_front_customer" style="display:none;">%s %s</div>',__('<img src="https://funpromotion.gr/wp-content/uploads/2023/10/price_per-icon.png" style="margin-right:8px;margin-top: -3px;"><strong style="">Τιμή / τμχ. πελάτη: </strong>','woocommerce'),'<span class="price_per_product_front_customer" style="font-weight: 700;margin-left: 5px;color: #f70;font-size: 17px;"></span>'
                );
            }
            
            //Open div questionmark iconWrap (works for both admin and customer)
            echo sprintf(
                '<div class="iconWrap" style="display:none;"> <img src="https://funpromotion.gr/wp-content/uploads/2024/02/prices-icon-info.png" style="float: right;"> <div class="tooltipCustom">'
            );

                echo sprintf(
                    '<div id="info" style="display:none;">%s %s', __('','woocommerce'),''
                );
                echo sprintf(
                    '<div style="text-align: center;padding: 8px 5px;font-size: 12px;display: flex;justify-content: center;margin-bottom: 20px;border: 1px solid #ddd;border-radius: 5px;">', __('','woocommerce'),''
                );
                //Μέγεθος εκτύπωσης (works for both admin and customer)
                echo sprintf(
                    '<div id="max_printing_size" style="display:none;">%s %s</div>', __('<strong style="padding-bottom: 5px;float: left;">Μέγεθος εκτύπωσης</strong><br>','woocommerce'),'<span class="printing_size"></span></div></div>'
                );

                //Τεχνική εκτύπωσης (works for admin)
                if (current_user_can('administrator')) {
                    echo sprintf(
                        '<div id="info_tech" style="display:none;">%s %s', __('','woocommerce'),''
                    );
                    echo sprintf(
                        '<div style="text-align: center;padding: 8px 5px;font-size: 12px;display: flex;justify-content: center;margin-bottom: 20px;border: 1px solid #ddd;border-radius: 5px;">', __('','woocommerce'),''
                    );
                    echo sprintf(
                        '<div id="printing_technique_field" style="display:none;">%s %s</div>', __('<strong style="padding-bottom: 5px;float: left;">Τεχνική εκτύπωσης</strong><br>','woocommerce'),'<span class="printing_technique"></span></div></div>'
                    );
                }

                //Κόστος προϊόντων (works for both admin and customer)
                echo sprintf(
                    '<div id="price_product_price" style="display:none;padding-bottom:15px;">%s %s</div>', __('<strong>Κόστος προϊόντων:</strong>','woocommerce'),'<span class="product_price"></span>'
                );

            //Close div questionmark iconWrap (works for both admin and customer)
            //Κόστος εκτύπωσης (works for both admin and customer)
            echo sprintf(
                '<div id="print_cart_total" style="display:none;">%s %s</div>', __('<strong>Κόστος εκτύπωσης:</strong>','woocommerce'),'<span class="print_total"></span></div></div>'
            );

            //Συνολικό κόστος (works for both admin and customer)
            echo sprintf(
                '<div id="price_cart_total" style="display:none;">%s %s</div>', __('<img src="https://funpromotion.gr/wp-content/uploads/2023/10/price_per-icon.png" style="margin-right:8px;margin-top: -3px;"><strong>Σύνολο:</strong>','woocommerce'),'<span class="cart_total"></span> <span class="fpa">+ Φ.Π.Α.</span>'
            );

            if (current_user_can('administrator')) {
                //Συνολικό κόστος πελάτη (works for admin)
                echo sprintf(
                    '<div id="price_cart_total_cus" style="display:none;">%s %s</div>', __('<img src="https://funpromotion.gr/wp-content/uploads/2023/10/price_per-icon.png" style="margin-right:8px;margin-top: -3px;"><strong>Σύνολο πελάτη:</strong>','woocommerce'),'<span class="cart_total_cus"></span> <span class="fpa">+ Φ.Π.Α.</span>'
                );
            }

            //Open Διακύμανση τιμής button (works for both admin and customer)
            echo (
                '<div id="overlaySidenav" style="display:none;"></div>'
            );

            //Open Διακύμανση τιμής button (works for both admin and customer)
            echo (
                '<div id="openNavBtn" onclick="openNav()">Διακύμανση τιμής</div>'
            );
            echo (
                '<div id="mySidenav" class="sidenav">'
            );
                echo (
                    '<a href="javascript:void(0)" onclick="closeNav()">&times;</a>'
                );

                echo (
                    '<h3>Διακύμανση τιμής</h3>
                    <h4>Order big, save even bigger!</h4>
                    <p>Order big, save even bigger! <br>As you increase the size of your order, the cost per item decreases. This is based on a 1 color print and does not include set up fees. The larger percentage savings occur at these quantities:</p>'
                );

                if (current_user_can('administrator')) {
                    echo (
                        //START PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΡΟΜΗΘΕΥΤΗ"
                        '<table id="table_price" style="display:none;border:1px solid #e1e1e1;margin-top:30px;float: left;">
                            <thead>
                                <tr style="background-color: #F3F3F3;">
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Τεμάχια</th>
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Τιμή</th>
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Ποσοστό έκπτωσης</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">50</td>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price50"></span></td>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price50_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">100</td>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price100"></span></td>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price100_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">250</td>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price250"></span></td>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price250_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">500</td>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price500"></span></td>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price500_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">1200</td>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price1000"></span></td>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price1000_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">2500</td>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price2500"></span></td>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price2500_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">5000</td>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price5000"></span></td>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price5000_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">10000</td>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price10000"></span></td>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price10000_margin"></span></td>
                                </tr>
                            </tbody>
                        </table>'
                        //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΡΟΜΗΘΕΥΤΗ"
                    );
                    
                    //START PRICES FOR ADMINISTRATOR "ΤΙΜΗ ΠΕΛΑΤΗ ΑΝΑ ΠΡΟΪΟΝ"
                    echo sprintf('<div id="price_per_product_price_customer" style="display:none;float: left;min-width: 100%%;font-size: 14px;margin-top: -10px;">%s %s</div>',__('<strong style="border-bottom: 2px solid #EE8421;font-weight: 300;">Κόστος πελάτη ανά προϊόν: </strong>','woocommerce'),'<span class="price_per_product_customer" style="font-weight: 300;margin-left: 5px;color: #f70;font-size: 17px;"></span>');
                    //END PRICES FOR ADMINISTRATOR "ΤΙΜΗ ΠΕΛΑΤΗ ΑΝΑ ΠΡΟΪΟΝ"

                    //START PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                    echo (
                        '<table id="table_price_customer" style="display:none;border:1px solid #e1e1e1;margin-top:5px;float: left;">
                            <thead>
                                <tr style="background-color: #F3F3F3;">
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Τεμάχια</th>
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Τιμή</th>
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Ποσοστό έκπτωσης</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">50</td>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price50_customer"></span></td>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price50_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">100</td>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price100_customer"></span></td>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price100_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">250</td>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price250_customer"></span></td>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price250_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">500</td>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price500_customer"></span></td>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price500_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">1000</td>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price1000_customer"></span></td>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price1000_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">2500</td>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price2500_customer"></span></td>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price2500_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">5000</td>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price5000_customer"></span></td>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price5000_margin_customer"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">10000</td>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price10000_customer"></span></td>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price10000_margin_customer"></span></td>
                                </tr>
                            </tbody>
                        </table>'
                        //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                    );
                } else {
                    echo (
                        //START PRICES FOR CUSTOMERS "ΠΙΝΑΚΑΣ ΤΙΜΩΝ"
                        '<table id="table_price" style="display:none;border:1px solid #e1e1e1;margin-top:30px;float: left;">
                            <thead>
                                <tr style="background-color: #F3F3F3;">
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Τεμάχια</th>
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Τιμή</th>
                                    <th class="tg-0pky" style="width: 33%;font-size: 13px;text-align: center;border-right: 1px solid #e1e1e1;padding: 12px;">Ποσοστό έκπτωσης</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">50</td>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price50"></span></td>
                                    <td id="tg-50lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price50_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">100</td>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price100"></span></td>
                                    <td class="tg-100lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price100_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">250</td>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price250"></span></td>
                                    <td class="tg-250lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price250_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">500</td>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price500"></span></td>
                                    <td class="tg-500lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price500_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">1000</td>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price1000"></span></td>
                                    <td class="tg-1000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price1000_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">2500</td>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price2500"></span></td>
                                    <td class="tg-2500lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price2500_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">5000</td>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price5000"></span></td>
                                    <td class="tg-5000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price5000_margin"></span></td>
                                </tr>
                                <tr>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/angle-right.png" style="margin-right:5px;margin-top: -3px;">10000</td>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;border-right: 1px solid #e1e1e1;"><span class="tg_price10000"></span></td>
                                    <td class="tg-10000lax" style="text-align: center;font-size: 13px;padding: 10px;"><img src="https://funpromotion.gr/wp-content/uploads/2024/07/percentage.png" style="margin-right:5px;margin-top: -3px;"><span class="tg_price10000_margin"></span></td>
                                </tr>
                            </tbody>
                        </table>'
                        //END PRICES FOR CUSTOMERS "ΠΙΝΑΚΑΣ ΤΙΜΩΝ"
                    );
                }
            //Close Διακύμανση τιμής button (works for both admin and customer)
            echo (
                '</div>'
            );
        //Close inner section that contains prices (works for both admin and customer)
        echo sprintf(
            '</section>'
        );
        //Open inner section that contains shipping days (works for both admin and customer)
        echo sprintf(
            '<section id="daysInfoElement" style="display:none;">'
        );

            //Shipping days (works for both admin and customer)
            echo sprintf(
                '<div class="shipping-days-icon" style=""> <img src="https://funpromotion.gr/wp-content/uploads/2024/02/delivery-icon-info.png" style="float: right;"> <div class="days-icon-tooltip">*Εάν η επιβεβαίωση της παραγγελίας γίνει μέχρι τις 23:59</div></div>'
            );
            //Shipping days (works for both admin and customer)
            echo sprintf(
                '<div id="shipping_days_shipping" style="display:none;">%s %s</div>',__(' <div class="shipping_days_shipping_img"><img src="https://funpromotion.gr/wp-content/uploads/2023/10/shipping-regular.png" alt="Regular shipping" width="40" height="22"></div> <strong style="font-weight: 600;float: left; margin-top: 8px; width: 100%;">Απλή παράδοση </strong>','woocommerce'),'<span class="shipping_days" style="float: left; margin-top: 2px; width: 100%;"></span><span class="shipping_cost" style="float: left; color:#6a34bc; font-weight: 700; margin-top: 5px; width: 100%;"></span>'
            );
            //Shipping days express (works for both admin and customer)
            echo sprintf(
                '<div id="shipping_days_express_shipping" style="display:none;">%s %s</div>',__(' <div class="shipping_days_express_shipping_img"><img src="https://funpromotion.gr/wp-content/uploads/2023/10/shipping-express.png" alt="Express shipping" width="40" height="22"></div> <strong style="font-weight: 600;float: left; margin-top: 8px; width: 100%;">Express παράδοση </strong>','woocommerce'),'<span class="shipping_days_express" style="float: left; margin-top: 2px; width: 100%;"></span><span class="shipping_cost_express" style="float: left; color:#6a34bc; font-weight: 700; margin-top: 5px; width: 100%;"></span>'
            );
        //Close sinner section that contains shipping days (works for both admin and customer)
        echo sprintf(
            '</section>'
        );

    //Close section that contains info (works for both admin and customer)
    echo sprintf(
        '</section>'
    );
    ?>

    <!DOCTYPE html>
    <html>
        <head>
            <script src="https://funpromotion.gr/wp-content/themes/woodmart-child/prices_margin.js"></script>
        </head>
    <body>
    
    <script>
        Array.prototype.hasMin = function(attrib) {
            const checker = (o, i) => typeof(o) === 'object' && o[i]
            return (this.length && this.reduce(function(prev, curr) {
                const prevOk = parseFloat(checker(prev, attrib));
                const currOk = parseFloat(checker(curr, attrib));
                if (!prevOk && !currOk) return {};
                if (!prevOk) return curr;
                if (!currOk) return prev;
                return prev[attrib] < curr[attrib] ? prev : curr;
            })) || null;
        }
        <?php //echo "window.productData = ". $product_data_json . ";"; ?>
        var encodedProductDataJson = "<?php echo $encoded_product_data_json; ?>";
        var decodedProductDataJson = atob(encodedProductDataJson);
        window.productData = JSON.parse(decodedProductDataJson);
        //SHIPPING BUTTONS
        $(document).ready(function() {
            jQuery(function($) {
                // create a javascript object with product data
                var encodedProductDataJson = "<?php echo $encoded_product_data_json; ?>";
                var decodedProductDataJson = atob(encodedProductDataJson);
                var productData = JSON.parse(decodedProductDataJson);
                <?php //echo "var productData = ". $product_data_json . ";"; ?>
                        //if ( $show ) { 
                //var product_total = parseFloat( productData.price * $('[name=quantity]').val());
                //$('#product_total_price .price').html( productData.currency + product_total.toFixed(2) );
                //var price_print_setup = parseFloat(productData.price_print_setup * $('[name=quantity]').val());
                //$('#price_print_setup .print_setup').html( price_print_setup.toFixed(2)); 
                //$('#product_total_price').show();
                //$('#price_print_setup').show();
            
                        //}
                        
                window.productVariable = [];
                window.MouseClick = false;

                let product_variations = $('.variations_form').data('product_variations');
                // when the quantity is changed or a product option is selected
                jQuery('[name=quantity], table.variations select').on('change', function() {
                    let currentData = $(this);
                    setTimeout(function() {
                        let cartTotal = 0;
                        $('.shipping_days_express_shipping_img').removeClass('active-bg');
                        // shows data based on product type
                        switch (productData.type) {
                
                            case 'variable':
                                // gets the id variation based on the options chosen
                                var variation_id = $('input.variation_id').val();
                                var SelectOpt = $('.variations_form').find('select')[0];
                                var arraySum = [];
                                var arraySumNo = [];
                                if (currentData.val()) {

                                    if ($(SelectOpt).attr('id') === currentData.attr('id')) {
            
                                    
                                        product_variations.forEach(function(el, ind) {
                                            if (el.attributes['attribute_' + currentData.attr('id')] === currentData.val() && Object.keys(el.attributes).length === Object.values(el.attributes).filter(Boolean).length) {
                                                arraySum.push({
                                                    "ID": el.variation_id,
                                                    "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                                });
                                                if (Object.keys(el.attributes).indexOf('attribute_pa_size') !== -1 && el.attributes['attribute_pa_size'].length > 0) {
                                                    $('select[name="attribute_pa_size"]').closest('tr').css('opacity', 1).closest('tr').css('height', 'auto').closest('tr').css('display', 'table-row');
                                                }
                                            } else if (el.attributes['attribute_' + currentData.attr('id')] === currentData.val() && Object.keys(el.attributes).length === Object.values(el.attributes).length) {
                                                if (Object.keys(el.attributes).indexOf('attribute_pa_size') !== -1 && el.attributes['attribute_pa_size'].length ===0) { 
                                                    $('select[name="attribute_pa_size"]').closest('tr').css('opacity', 0).closest('tr').css('height', 0).closest('tr').css('display', 'table-column');
                                                } 
                                                arraySumNo.push({
                                                    "ID": el.variation_id,
                                                    "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                                });
                                            }
                                        });
                                        // console.log(arraySum.hasMin("Cost"));
                                        // console.log(arraySum);
                                        let minPrpriceID = arraySum.hasMin("Cost");
                                        let minPrpriceIDNo = arraySumNo.hasMin("Cost");
                                
                                        if (minPrpriceID) {
                                            let arrayVerProduct = [];
                                            product_variations.forEach(function(el, ind) {
                                                // console.log(el.variation_id, minPrpriceID.ID);
                                                if (el.variation_id === minPrpriceID.ID) {
                                                    arrayVerProduct.push(el.attributes);
                                                } else if (arraySum.length === 0 && el.variation_id === minPrpriceIDNo.ID) {
                                                    arrayVerProduct.push(el.attributes);
                                                }
                                            });
                                            window.productVariable = arrayVerProduct[0];
                                            // console.log(arrayVerProduct[0]);
                                            Object.values(arrayVerProduct[0]).reverse().forEach(function(data, key) {
                                            
                                            });
                                            
                                            if (arrayVerProduct.indexOf('no-print') !== -1) {
                                                for ($x = 1; $x < $('.variations').find('tr').length; $x++) {
                                                    $($('.variations').find('tr')[$x]).hide();
                                                }
                                            } else {
                                                for ($x = 1; $x < $('.variations').find('tr').length; $x++) {

                                                    $($('.variations').find('tr')[$x]).show();
                                                }
                                            }
                                        } else if (minPrpriceIDNo) {
                                            let arrayVerProduct = [];
                                            product_variations.forEach(function(el, ind) {
                                                if (el.variation_id === minPrpriceIDNo.ID) {
                                                    arrayVerProduct.push(el.attributes);
                                                }
                                            });
                                            var ArrayData = [];
                                            window.productVariable = arrayVerProduct[0];
                                            Object.values(arrayVerProduct[0]).forEach(function(data, key) {
                                                var valSelect;
                                                if (!data && key > 1) {
                                                    var keyHide = Object.keys(arrayVerProduct[0])[key];
                                                    var idSelect = keyHide.replace('attribute_','');
                                                    valSelect = $($('#' + idSelect).find('option')[1]).val();
                                                }
                                                if (data.length > 0) {
                                                    ArrayData.push(data);
                                                }
                                                if (valSelect) {
                                                    ArrayData.push(valSelect);
                                                }
                                            });
                                            if (ArrayData.indexOf('no-print') !== -1) {
                                                for ($x = 1; $x < $('.variations').find('tr').length; $x++) {
                                                    $($('.variations').find('tr')[$x]).hide();
                                                }
                                            } else {
                                                for ($x = 1; $x < $('.variations').find('tr').length; $x++) {

                                                    $($('.variations').find('tr')[$x]).show();
                                                }
                                            }
                                            ArrayData.reverse().forEach(function(val) {
                                        
                                            });
                                            $('.variations_form').find('[name=quantity]').trigger('change');
                                        }
                                    }
                            
                                }

                                // if the variation id is valid and the current option is different from "Choose an option"
                                if (parseInt($('input.variation_id').val()) > 0 && $('input.variation_id').val() != '' && $(this).find('option').filter(':selected').val() != '') {
                                    
                                    //DISPLAY DIV WITH INFORMATION FOR ADMINISTRATOR AND CUSTOMER
                                    $('#sectionInfoElement').fadeIn(600);
                                    $('#pricesInfoElement').fadeIn(600);
                                    $('#daysInfoElement').fadeIn(600);
                                    //DISPLAY PRICES FOR ADMINISTRATOR AND CUSTOMER "ΤΙΜΗ ΑΝΑ ΠΡΟΪΟΝ"
                                    $('#price_per_product_price').fadeIn(600);
                                    //DISPLAY PRICES FOR ADMINISTRATOR "ΤΙΜΗ ΠΕΛΑΤΗ ΑΝΑ ΠΡΟΪΟΝ"
                                    $('#price_per_product_price_front_customer').fadeIn(600);
                                    $('#price_per_product_price_customer').fadeIn(600);
                                    //DISPLAY PRICES FOR ADMINISTRATOR AND CUSTOMER "ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ"
                                    $('#price_cart_total').fadeIn(600);
                                    //DISPLAY PRICES FOR ADMINISTRATOR "ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ ΠΕΛΑΤΗ"
                                    $('#price_cart_total_cus').fadeIn(600);

                                    $('#shipping_days_shipping').fadeIn(600);
                                    $('#shipping_days_express_shipping').fadeIn(600);
                                    

                                    $('.iconWrap').fadeIn(600);
                                    $('.iconWrap .tooltipCustom #info').show();
                                    $('.iconWrap .tooltipCustom #max_printing_size').show();
                                    $('.iconWrap .tooltipCustom #info_tech').show();
                                    $('.iconWrap .tooltipCustom #printing_technique_field').show();
                                    $('.iconWrap .tooltipCustom #price_product_price').show();
                                    $('.iconWrap .tooltipCustom #print_cart_total').show();

                                    $('#table_price').fadeIn(600);

                                    //PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                                    $('#table_price_customer').fadeIn(600);
                                    //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"


                                    // gets the object based on the selected variation 1

                                    var obj = productData.variation[variation_id];
                                    // update the fields
                                    var _this = $('[name=quantity]');
                                    var pr_quantity = _this.val();

                                    var manipulation_price = '<?php the_field('manipulation'); ?>';

                                    var encodedPrice = "<?php echo $encoded_price; ?>";
                                    var price = atob(encodedPrice);
                                    //var price = parseFloat(<?php //echo json_encode($price_main); ?>);
                                    var brand = '<?php echo esc_js(the_field('brand')); ?>';

                                    if (brand == 'Midocean') {
                                        var priceMultiplier = mPriceMultiplier;
                                        var printMultiplier = mPrintMultiplier;
                                    } else if (brand == 'Xindao') {
                                        var priceMultiplier = xPriceMultiplier;
                                        var printMultiplier = xPrintMultiplier;
                                    } else if (brand == 'Stricker') {
                                        var priceMultiplier = sPriceMultiplier;
                                        var printMultiplier = sPrintMultiplier;
                                    } else if (brand == 'PF') {
                                        var priceMultiplier = pPriceMultiplier;
                                        var printMultiplier = pPrintMultiplier;
                                    } else if (brand == 'kits') {
                                        var priceMultiplier = kPriceMultiplier;
                                        var printMultiplier = kPrintMultiplier;
                                    } else if (brand == 'Stock') {
                                        var priceMultiplier = stoPriceMultiplier;
                                        var printMultiplier = stoPrintMultiplier;
                                    } else if (brand == 'Chillys') {
                                        var priceMultiplier = chiPriceMultiplier;
                                        var printMultiplier = chiPrintMultiplier;
                                    } else if (brand == 'Mdisplay') {
                                        var priceMultiplier = mdiPriceMultiplier;
                                        var printMultiplier = mdiPrintMultiplier;
                                    }

                                    var price_print_1_3_customer = parseFloat(obj.price_print_1_3 * printMultiplier);
                                    var price_print_3_5_customer = parseFloat(obj.price_print_3_5 * printMultiplier);
                                    var price_print_5_10_customer = parseFloat(obj.price_print_5_10 * printMultiplier);
                                    var price_print_10_25_customer = parseFloat(obj.price_print_10_25 * printMultiplier);
                                    var price_print_25_50_customer = parseFloat(obj.price_print_25_50 * printMultiplier);
                                    var price_print_50_100_customer = parseFloat(obj.price_print_50_100 * printMultiplier);
                                    var price_print_100_250_customer = parseFloat(obj.price_print_100_250 * printMultiplier);
                                    var price_print_250_500_customer = parseFloat(obj.price_print_250_500 * printMultiplier);
                                    var price_print_500_1000_customer = parseFloat(obj.price_print_500_1000 * printMultiplier);
                                    var price_print_1000_2500_customer = parseFloat(obj.price_print_1000_2500 * printMultiplier);
                                    var price_print_2500_5000_customer = parseFloat(obj.price_print_2500_5000 * printMultiplier);
                                    var price_print_5000_10000_customer = parseFloat(obj.price_print_5000_10000 * printMultiplier);
                                    var price_print_10000_infinity_customer = parseFloat(obj.price_print_10000_infinity * printMultiplier);
                                    if (brand == 'kits') {
                                        var price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier);
                                    } else {
                                        var price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier + 30);
                                    }
                                    //var price_print_setup_customer;

                                    /*// Function to calculate the price based on the active swatch
                                    function handleSwatchSelectionNoprint(activeSwatchValue) {
                                        //console.log("Active swatch value Setup:", activeSwatchValue); // Debug log
                                        if (activeSwatchValue === 'no-print') {
                                            price_print_setup_customer = parseFloat(obj.price_print_setup);
                                        } else {
                                            price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier + 30);
                                        }
                                        //console.log("Calculated price_print_setup_customer:", price_print_setup_customer);
                                        // Update the display or perform further actions with the calculated price
                                        updatePriceDisplay(price_print_setup_customer);
                                    }*/
                                
                                    // ON CHANGING PRICES ALSO CHANGE ON SINGLE-PRODUCT/PRICE.PHP + LOOP/PRICE.PHP
									if (brand == 'Stock') {
                                        if (price >= 0 && price <= 1.22) {
                                            var price_customer_1 = price * priceMultiplier * priceMultiplier_1_122;
                                            var price_customer_2 = price * priceMultiplier * priceMultiplier_1_122;
                                            var price_customer_5 = price * priceMultiplier * priceMultiplier_1_122;
                                            var price_customer_10 = price * priceMultiplier * priceMultiplier_1_122;
                                            var price_customer_25 = price * priceMultiplier * priceMultiplier_25_122;
                                            var price_customer_50 = price * priceMultiplier * priceMultiplier_50_122;
                                            var price_customer_100 = price * priceMultiplier * priceMultiplier_100_122;
                                            var price_customer_250 = price * priceMultiplier * priceMultiplier_250_122;
                                            var price_customer_500 = price * priceMultiplier * priceMultiplier_500_122;
                                            var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_122;
                                            var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_122;
                                            var price_customer_5000 = price * priceMultiplier * priceMultiplier_2500_122;
                                            var price_customer_10000 = price * priceMultiplier * priceMultiplier_2500_122;
                                        } else if (price > 1.22 && price <= 3.05) {
                                            var price_customer_1 = price * priceMultiplier * priceMultiplier_1_305;
                                            var price_customer_2 = price * priceMultiplier * priceMultiplier_1_305;
                                            var price_customer_5 = price * priceMultiplier * priceMultiplier_1_305;
                                            var price_customer_10 = price * priceMultiplier * priceMultiplier_1_305;
                                            var price_customer_25 = price * priceMultiplier * priceMultiplier_25_305;
                                            var price_customer_50 = price * priceMultiplier * priceMultiplier_50_305;
                                            var price_customer_100 = price * priceMultiplier * priceMultiplier_100_305;
                                            var price_customer_250 = price * priceMultiplier * priceMultiplier_250_305;
                                            var price_customer_500 = price * priceMultiplier * priceMultiplier_500_305;
                                            var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_305;
                                            var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_305;
                                            var price_customer_5000 = price * priceMultiplier * priceMultiplier_2500_305;
                                            var price_customer_10000 = price * priceMultiplier * priceMultiplier_2500_305;
                                        } else if (price > 3.05 && price <= 6.10) {
                                            var price_customer_1 = price * priceMultiplier * priceMultiplier_1_610;
                                            var price_customer_2 = price * priceMultiplier * priceMultiplier_1_610;
                                            var price_customer_5 = price * priceMultiplier * priceMultiplier_1_610;
                                            var price_customer_10 = price * priceMultiplier * priceMultiplier_1_610;
                                            var price_customer_25 = price * priceMultiplier * priceMultiplier_25_610;
                                            var price_customer_50 = price * priceMultiplier * priceMultiplier_50_610;
                                            var price_customer_100 = price * priceMultiplier * priceMultiplier_100_610;
                                            var price_customer_250 = price * priceMultiplier * priceMultiplier_250_610;
                                            var price_customer_500 = price * priceMultiplier * priceMultiplier_500_610;
                                            var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_610;
                                            var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_610;
                                            var price_customer_5000 = price * priceMultiplier * priceMultiplier_2500_610;
                                            var price_customer_10000 = price * priceMultiplier * priceMultiplier_2500_610;
                                        } else if (price > 6.10 && price <= 12.20) {
                                            var price_customer_1 = price * priceMultiplier * priceMultiplier_1_1220;
                                            var price_customer_2 = price * priceMultiplier * priceMultiplier_1_1220;
                                            var price_customer_5 = price * priceMultiplier * priceMultiplier_1_1220;
                                            var price_customer_10 = price * priceMultiplier * priceMultiplier_1_1220;
                                            var price_customer_25 = price * priceMultiplier * priceMultiplier_25_1220;
                                            var price_customer_50 = price * priceMultiplier * priceMultiplier_50_1220;
                                            var price_customer_100 = price * priceMultiplier * priceMultiplier_100_1220;
                                            var price_customer_250 = price * priceMultiplier * priceMultiplier_250_1220;
                                            var price_customer_500 = price * priceMultiplier * priceMultiplier_500_1220;
                                            var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_1220;
                                            var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_1220;
                                            var price_customer_5000 = price * priceMultiplier * priceMultiplier_2500_1220;
                                            var price_customer_10000 = price * priceMultiplier * priceMultiplier_2500_1220;
                                        } else if (price > 12.20 && price <= 999.99) {
                                            var price_customer_1 = price * priceMultiplier * priceMultiplier_1_999;
                                            var price_customer_2 = price * priceMultiplier * priceMultiplier_1_999;
                                            var price_customer_5 = price * priceMultiplier * priceMultiplier_1_999;
                                            var price_customer_10 = price * priceMultiplier * priceMultiplier_1_999;
                                            var price_customer_25 = price * priceMultiplier * priceMultiplier_25_999;
                                            var price_customer_50 = price * priceMultiplier * priceMultiplier_50_999;
                                            var price_customer_100 = price * priceMultiplier * priceMultiplier_100_999;
                                            var price_customer_250 = price * priceMultiplier * priceMultiplier_250_999;
                                            var price_customer_500 = price * priceMultiplier * priceMultiplier_500_999;
                                            var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_999;
                                            var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_999;
                                            var price_customer_5000 = price * priceMultiplier * priceMultiplier_2500_999;
                                            var price_customer_10000 = price * priceMultiplier * priceMultiplier_2500_999;
                                        }
                                    } else if (brand == 'Chillys') {
                                        if (price >= 0 && price <= 999.99) {
                                            var price_customer_1 = price * priceMultiplier * chipriceMultiplier_50;
                                            var price_customer_2 = price * priceMultiplier * chipriceMultiplier_50;
                                            var price_customer_5 = price * priceMultiplier * chipriceMultiplier_50;
                                            var price_customer_10 = price * priceMultiplier * chipriceMultiplier_50;
                                            var price_customer_25 = price * priceMultiplier * chipriceMultiplier_50;
                                            var price_customer_50 = price * priceMultiplier * chipriceMultiplier_50;
                                            var price_customer_100 = price * priceMultiplier * chipriceMultiplier_100;
                                            var price_customer_250 = price * priceMultiplier * chipriceMultiplier_250;
                                            var price_customer_500 = price * priceMultiplier * chipriceMultiplier_500;
                                            var price_customer_1000 = price * priceMultiplier * chipriceMultiplier_500;
                                            var price_customer_2500 = price * priceMultiplier * chipriceMultiplier_500;
                                            var price_customer_5000 = price * priceMultiplier * chipriceMultiplier_500;
                                            var price_customer_10000 = price * priceMultiplier * chipriceMultiplier_500;
                                        }
                                    } else if (brand == 'Mdisplay') {
                                        if (price >= 0 && price < 150) {
                                            var price_customer_1 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_2 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_5 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_10 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_25 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_50 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_100 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_250 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_500 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_1000 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_2500 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_5000 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                            var price_customer_10000 = price * priceMultiplier * mdipriceMultiplier_1_150;
                                        } else if (price >= 150 && price < 500) {
                                            var price_customer_1 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_2 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_5 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_10 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_25 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_50 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_100 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_250 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_500 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_1000 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_2500 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_5000 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                            var price_customer_10000 = price * priceMultiplier * mdipriceMultiplier_1_500;
                                        } else if (price >= 500 && price <= 9999.99) {
                                            var price_customer_1 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_2 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_5 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_10 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_25 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_50 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_100 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_250 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_500 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_1000 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_2500 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_5000 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                            var price_customer_10000 = price * priceMultiplier * mdipriceMultiplier_1_999;
                                        }
                                    } else {
										if (price >= 0 && price <= 0.50) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_01_1;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_01_1;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_01_1;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_01_1;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_01_1;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_01_1;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_01_1;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_01_1;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_01_1;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_01_1;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_01_1;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_01_1;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_01_1;
										} else if (price > 0.50 && price <= 1.00) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_05_1;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_05_1;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_05_1;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_05_1;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_05_1;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_05_1;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_05_1;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_05_1;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_05_1;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_05_1;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_05_1;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_05_1;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_05_1;
										} else if (price > 1.00 && price <= 2.50) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_1_25;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_1_25;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_1_25;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_1_25;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_1_25;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_1_25;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_1_25;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_1_25;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_1_25;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_1_25;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_1_25;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_1_25;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_1_25;
										} else if (price > 2.50 && price <= 5.00) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_25_5;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_25_5;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_25_5;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_25_5;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_25_5;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_25_5;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_25_5;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_25_5;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_25_5;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_25_5;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_25_5;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_25_5;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_25_5;
										} else if (price > 5.00 && price <= 7.50) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_5_75;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_5_75;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_5_75;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_5_75;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_5_75;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_5_75;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_5_75;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_5_75;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_5_75;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_5_75;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_5_75;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_5_75;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_5_75;
										} else if (price > 7.50 && price <= 10) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_75_10;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_75_10;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_75_10;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_75_10;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_75_10;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_75_10;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_75_10;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_75_10;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_75_10;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_75_10;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_75_10;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_75_10;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_75_10;
										} else if (price > 10.00 && price <= 15.00) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_10_15;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_10_15;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_10_15;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_10_15;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_10_15;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_10_15;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_10_15;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_10_15;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_10_15;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_10_15;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_10_15;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_10_15;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_10_15;
										} else if (price > 15.00 && price <= 20.00) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_15_20;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_15_20;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_15_20;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_15_20;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_15_20;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_15_20;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_15_20;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_15_20;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_15_20;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_15_20;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_15_20;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_15_20;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_15_20;
										} else if (price > 20.00 && price <= 30.00) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_20_30;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_20_30;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_20_30;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_20_30;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_20_30;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_20_30;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_20_30;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_20_30;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_20_30;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_20_30;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_20_30;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_20_30;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_20_30;
										} else if (price > 30.00 && price <= 999.99) {
											var price_customer_1 = price * priceMultiplier * priceMultiplier_1_30_99;
											var price_customer_2 = price * priceMultiplier * priceMultiplier_1_30_99;
											var price_customer_5 = price * priceMultiplier * priceMultiplier_1_30_99;
											var price_customer_10 = price * priceMultiplier * priceMultiplier_1_30_99;
											var price_customer_25 = price * priceMultiplier * priceMultiplier_25_30_99;
											var price_customer_50 = price * priceMultiplier * priceMultiplier_50_30_99;
											var price_customer_100 = price * priceMultiplier * priceMultiplier_100_30_99;
											var price_customer_250 = price * priceMultiplier * priceMultiplier_250_30_99;
											var price_customer_500 = price * priceMultiplier * priceMultiplier_500_30_99;
											var price_customer_1000 = price * priceMultiplier * priceMultiplier_1000_30_99;
											var price_customer_2500 = price * priceMultiplier * priceMultiplier_2500_30_99;
											var price_customer_5000 = price * priceMultiplier * priceMultiplier_5000_30_99;
											var price_customer_10000 = price * priceMultiplier * priceMultiplier_10000_30_99;
										}
									}

                                    // SETTING SHIPPING DAYS BASED ON CHOSEN TECHNIQUE, QUANTITY AND BRAND 
                                    var brand = '<?php the_field("brand"); ?>';
                                    var shipping_days = 0;
                                    var shipping_days_express = 0;
                                    
                                    function handleSwatchSelection(activeSwatchValue) {
                                        console.log("Active Swatch Value: ", activeSwatchValue);
                                        const shippingOptions = {
                                            '1-color': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                            '2-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                            '3-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                            '4-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                            
                                            'laser': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                            'doming': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                            'digital-label': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                            'hot-stamping': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                            'embroidery': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                            
                                            'full-color': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                            'full-color-drinkware': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                            'full-color-background': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                            'no-print': {addExpress: 0, ranges: [{min: 1, max: 99, express: 0}, {min: 100, max: 249, express: 0}, {min: 250, max: 499, express: 0}, {min: 500, max: 999, express: 0}, {min: 1000, max: 2499, express: 0}]},
                                        };

                                        const brandAdjustments = {
                                            'Midocean': {
                                                '1-color': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                '2-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '3-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '4-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'laser': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'doming': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                'digital-label': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'hot-stamping': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                'embroidery': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'full-color': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-drinkware': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-background': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-sub': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'laser-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'no-print': {addExpress: 0, ranges: [{min: 1, max: 99, express: 0}, {min: 100, max: 249, express: 0}, {min: 250, max: 499, express: 0}, {min: 500, max: 999, express: 0}, {min: 1000, max: 2499, express: 0}]},
                                            },
                                            'Stricker': {
                                                '1-color': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                '2-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '3-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '4-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'laser': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'doming': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                'digital-label': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'hot-stamping': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                'embroidery': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'full-color': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-drinkware': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-background': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-sub': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},
                                                
                                                'laser-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'no-print': {addExpress: 0, ranges: [{min: 1, max: 99, express: 0}, {min: 100, max: 249, express: 0}, {min: 250, max: 499, express: 0}, {min: 500, max: 999, express: 0}, {min: 1000, max: 2499, express: 0}]},
                                            },
                                            'Xindao': {
                                                '1-color': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                '2-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '3-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '4-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'laser': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'doming': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                'digital-label': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'hot-stamping': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                'embroidery': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'full-color': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-drinkware': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-background': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-sub': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},
                                                
                                                'laser-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'no-print': {addExpress: 0, ranges: [{min: 1, max: 99, express: 0}, {min: 100, max: 249, express: 0}, {min: 250, max: 499, express: 0}, {min: 500, max: 999, express: 0}, {min: 1000, max: 2499, express: 0}]},
                                            },
                                            'PF': {
                                                '1-color': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                '2-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '3-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                '4-colors': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'laser': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'doming': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 6}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},

                                                'digital-label': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'hot-stamping': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},

                                                'embroidery': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 8}]},
                                                
                                                'full-color': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-drinkware': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-background': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'full-color-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'full-color-sub': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},
                                                
                                                'laser-360': {addExpress: 7, ranges: [{min: 1, max: 99, express: 7}, {min: 100, max: 249, express: 7}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 8}, {min: 1000, max: 2499, express: 9}]},

                                                'no-print': {addExpress: 0, ranges: [{min: 1, max: 99, express: 0}, {min: 100, max: 249, express: 0}, {min: 250, max: 499, express: 0}, {min: 500, max: 999, express: 0}, {min: 1000, max: 2499, express: 0}]},
                                            },
                                            'Stock': {
                                                '1-color': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 5}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                '2-colors': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 5}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                '3-colors': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 5}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                '4-colors': {addExpress: 5, ranges: [{min: 1, max: 99, express: 5}, {min: 100, max: 249, express: 5}, {min: 250, max: 499, express: 5}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},
                                                
                                                'laser': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'embroidery': {addExpress: 6, ranges: [{min: 1, max: 99, express: 6}, {min: 100, max: 249, express: 6}, {min: 250, max: 499, express: 7}, {min: 500, max: 999, express: 7}, {min: 1000, max: 2499, express: 7}]},
                                                
                                                'full-color': {addExpress: 4, ranges: [{min: 1, max: 99, express: 4}, {min: 100, max: 249, express: 4}, {min: 250, max: 499, express: 4}, {min: 500, max: 999, express: 5}, {min: 1000, max: 2499, express: 6}]},

                                                'no-print': {addExpress: 0, ranges: [{min: 1, max: 99, express: 0}, {min: 100, max: 249, express: 0}, {min: 250, max: 499, express: 0}, {min: 500, max: 999, express: 0}, {min: 1000, max: 2499, express: 0}]},
                                            }
                                        };

                                        //DEFAULT EXPRESS AND STANDARD SHIPPING DAYS
                                        if (brand == 'Stock') {
                                            var standard_default = 1;
											var express_default = -1;
                                        } else if (brand == 'Mdisplay') {
                                            var standard_default = 6;
											var express_default = 3;
                                        } else {
											// Set def shipping days (standard = 4 , Xmas = 8)
                                            var standard_default = 4;
											var express_default = 3;
                                        }

                                        const swatchOption = shippingOptions[activeSwatchValue];
                                        if (!swatchOption) return; // Swatch value not recognized

                                        let brandAdjustment = brandAdjustments[brand]?.[activeSwatchValue];
                                        if (!brandAdjustment) brandAdjustment = { addExpress: 0, ranges: [] };

                                        let express = swatchOption.addExpress + brandAdjustment.addExpress + express_default;
                                        let standard = express + standard_default; // Initial standard calculation, might be updated based on quantity

                                        // Check if there are specific ranges defined for this swatch type
                                        const quantityRange = swatchOption.ranges.find(range => pr_quantity >= range.min && pr_quantity <= range.max);
                                        if (quantityRange) {
                                            express = quantityRange.express + brandAdjustment.addExpress + express_default;
                                            standard = express + standard_default; // Update standard based on the new express
                                        }

                                        // If brand adjustment has ranges, check those as well
                                        const brandRange = brandAdjustment.ranges.find(range => pr_quantity >= range.min && pr_quantity <= range.max);
                                        if (brandRange) {
                                            express = brandRange.express + express_default;
                                            standard = express + standard_default;
                                        }

                                        // If full-color or laser and _printing_technique_field CONTAINS 360 or SUB calculate different shipping days
                                        if (activeSwatchValue === 'full-color' && printing_technique_field.includes('-- 360 --')) {
                                            const fullColor360Ranges = brandAdjustments[brand]?.['full-color-360']?.ranges;
                                            const quantityRange = fullColor360Ranges.find(range => pr_quantity >= range.min && pr_quantity <= range.max);
                                            if (quantityRange) {
                                                express = quantityRange.express + express_default;
                                                standard = express + standard_default;
                                            }
                                        } else if (activeSwatchValue === 'full-color' && printing_technique_field.includes('-- SUB --')) {
                                            const fullColorSubRanges = brandAdjustments[brand]?.['full-color-sub']?.ranges;
                                            const quantityRange = fullColorSubRanges.find(range => pr_quantity >= range.min && pr_quantity <= range.max);
                                            if (quantityRange) {
                                                express = quantityRange.express + express_default;
                                                standard = express + standard_default;
                                            }
                                        } else if (activeSwatchValue === 'laser' && printing_technique_field.includes('-- 360 --')) {
                                            const laser360Ranges = brandAdjustments[brand]?.['laser-360']?.ranges;
                                            const quantityRange = laser360Ranges.find(range => pr_quantity >= range.min && pr_quantity <= range.max);
                                            if (quantityRange) {
                                                express = quantityRange.express + express_default;
                                                standard = express + standard_default;
                                            }
                                        } else if (printing_technique_field.includes('--5!')) { // Used for custom products "kits, etc"
                                            express = express_default;
                                            standard = 5;
                                        } else if (printing_technique_field.includes('--10!')) {
                                            express = express_default;
                                            standard = 10;
                                        } else if (printing_technique_field.includes('--15!')) {
                                            express = express_default;
                                            standard = 15;
                                        } else if (printing_technique_field.includes('--20!')) {
                                            express = express_default;
                                            standard = 20;
                                        } else if (printing_technique_field.includes('--25!')) {
                                            express = express_default;
                                            standard = 25;
                                        } else if (printing_technique_field.includes('--30!')) {
                                            express = express_default;
                                            standard = 30;
                                        } else if (printing_technique_field.includes('--35!')) {
                                            express = express_default;
                                            standard = 35;
                                        } else if (printing_technique_field.includes('--40!')) {
                                            express = express_default;
                                            standard = 40;
                                        } else if (printing_technique_field.includes('--45!')) {
                                            express = express_default;
                                            standard = 45;
                                        } else if (printing_technique_field.includes('--50!')) {
                                            express = express_default;
                                            standard = 50;
                                        }

                                        shipping_days_express = express;
                                        shipping_days = standard; // Ensure standard follows express changes
                                        useShippingDays();
                                    }

                                    $(document).ready(function() {
                                        // Check for the active swatch on page load
                                        var activeSwatchValueOnLoad = $('.active-swatch').data('value');
                                        // Assuming pr_quantity is a global variable or retrieved similarly to 'brand'
                                        var pr_quantity = parseInt($('#pr_quantity').val(), 10); // Example: Replace '#pr_quantity' with your actual quantity input ID
                                        if (activeSwatchValueOnLoad) {
                                            handleSwatchSelection(activeSwatchValueOnLoad, pr_quantity);
                                            //handleSwatchSelectionNoprint(activeSwatchValueOnLoad, pr_quantity);
                                        }
                                        // Listen for clicks on the swatches
                                        $(document).on('click', '.active-swatch', function() {
                                            var activeSwatchValue = $(this).data('value');
                                            handleSwatchSelection(activeSwatchValue, pr_quantity);
                                            //handleSwatchSelectionNoprint(activeSwatchValueOnLoad, pr_quantity);
                                        });
                                    });


                                    <?php if (current_user_can('administrator')) {?>
                                        var price_product_price = price * pr_quantity;
                                    <?php } ?>


                                    if ((pr_quantity >= 1) && (pr_quantity < 3)) {
                                    <?php if (current_user_can('administrator')) {?>
                                        var price_product_price_customer = price_customer_1 * pr_quantity;
                                        var price_print_price = parseFloat(obj.price_print_1_3 * pr_quantity);
                                        var price_print_price_customer = price_print_1_3_customer * pr_quantity;
                                    <?php } else { ?>
                                        var price_product_price = price_customer_1 * pr_quantity;
                                        var price_print_price = price_print_1_3_customer * pr_quantity;
                                    <?php } ?>
                                    }

                                    if ((pr_quantity >= 3) && (pr_quantity < 5)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_1 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_3_5 * pr_quantity);
                                            var price_print_price_customer = price_print_3_5_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_1 * pr_quantity;
                                            var price_print_price = price_print_3_5_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 5) && (pr_quantity < 10)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_1 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_5_10 * pr_quantity);
                                            var price_print_price_customer = price_print_5_10_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_1 * pr_quantity;
                                            var price_print_price = price_print_5_10_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 10) && (pr_quantity < 25)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_1 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_10_25 * pr_quantity);
                                            var price_print_price_customer = price_print_10_25_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_1 * pr_quantity;
                                            var price_print_price = price_print_10_25_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 25) && (pr_quantity < 50)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_25 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_25_50 * pr_quantity);
                                            var price_print_price_customer = price_print_25_50_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_25 * pr_quantity;
                                            var price_print_price = price_print_25_50_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 50) && (pr_quantity < 100)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_50 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_50_100 * pr_quantity);
                                            var price_print_price_customer = price_print_50_100_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_50 * pr_quantity;
                                            var price_print_price = price_print_50_100_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 100) && (pr_quantity < 250)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_100 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_100_250 * pr_quantity);
                                            var price_print_price_customer = price_print_100_250_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_100 * pr_quantity;
                                            var price_print_price = price_print_100_250_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 250) && (pr_quantity < 500)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_250 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_250_500 * pr_quantity);
                                            var price_print_price_customer = price_print_250_500_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_250 * pr_quantity;
                                            var price_print_price = price_print_250_500_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 500) && (pr_quantity < 1000)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_500 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_500_1000 * pr_quantity);
                                            var price_print_price_customer = price_print_500_1000_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_500 * pr_quantity;
                                            var price_print_price = price_print_500_1000_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 1000) && (pr_quantity < 2500)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_1000 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_1000_2500 * pr_quantity);
                                            var price_print_price_customer = price_print_1000_2500_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_1000 * pr_quantity;
                                            var price_print_price = price_print_1000_2500_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 2500) && (pr_quantity < 5000)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_2500 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_2500_5000 * pr_quantity);
                                            var price_print_price_customer = price_print_2500_5000_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_2500 * pr_quantity;
                                            var price_print_price = price_print_2500_5000_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 5000) && (pr_quantity < 10000)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_5000 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_5000_10000 * pr_quantity);
                                            var price_print_price_customer = price_print_5000_10000_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_5000 * pr_quantity;
                                            var price_print_price = price_print_5000_10000_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if ((pr_quantity >= 10000)) {
                                        <?php if (current_user_can('administrator')) {?>
                                            var price_product_price_customer = price_customer_10000 * pr_quantity;
                                            var price_print_price = parseFloat(obj.price_print_10000_infinity * pr_quantity);
                                            var price_print_price_customer = price_print_10000_infinity_customer * pr_quantity;
                                        <?php } else { ?>
                                            var price_product_price = price_customer_10000 * pr_quantity;
                                            var price_print_price = price_print_10000_infinity_customer * pr_quantity;
                                        <?php } ?>
                                    }

                                    if (!price_product_price) {
                                        price_product_price = 0;
                                    }

                                    $('#price_product_price .product_price').html(price_product_price.toFixed(2) + ' ' + obj.currency);

                                    var price_print_setup = parseFloat(obj.price_print_setup);

                                    var manipulation_product_total = parseFloat(manipulation_price * pr_quantity || 0);

                                    <?php if (current_user_can('administrator')) {?>

                                        var print_total = parseFloat(price_print_price + price_print_setup + manipulation_product_total || 0);
                                        $('#print_cart_total .print_total').html(print_total.toFixed(2) + ' ' + obj.currency);

                                        var cart_total = parseFloat(price_product_price + price_print_price + price_print_setup + manipulation_product_total || 0);
                                        cartTotal = cart_total;
                                        //$('#price_cart_total .cart_total').html(cart_total.toFixed(2) + ' ' + obj.currency);
                                        $('#price_cart_total .cart_total').html(cart_total.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + obj.currency);
                                        var cart_total_cus = parseFloat(price_product_price_customer + price_print_price_customer + price_print_setup_customer + manipulation_product_total || 0);
                                        cartTotal = cart_total_cus;
                                        //$('#price_cart_total_cus .cart_total_cus').html(cart_total_cus.toFixed(2) + ' ' + obj.currency);
                                        $('#price_cart_total_cus .cart_total_cus').html(cart_total_cus.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + obj.currency);

                                    <?php } else { ?>

                                        var print_total = parseFloat(price_print_price + price_print_setup_customer + manipulation_product_total || 0);
                                        $('#print_cart_total .print_total').html(print_total.toFixed(2) + ' ' + obj.currency);

                                        var cart_total = parseFloat(price_product_price + price_print_price + price_print_setup_customer + manipulation_product_total || 0);
                                        cartTotal = cart_total;
                                        //$('#price_cart_total .cart_total').html(cart_total.toFixed(2) + ' ' + obj.currency);
                                        $('#price_cart_total .cart_total').html(cart_total.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + obj.currency);

                                    <?php } ?>

                                    var cart_per_total = parseFloat(cart_total / pr_quantity || 0);
                                    //$('#price_per_product_price .price_per_product').html(cart_per_total.toFixed(2) + ' ' + obj.currency);
                                    

                                    //SHIPPING DAYS
                                    function addShippingDaysWithRange(startDate, daysToAdd) {
                                        var startDeliveryDate = new Date(startDate);
                                        var endDeliveryDate = new Date(startDate);

                                        // For adding working days
                                        while (daysToAdd > 0) {
                                            startDeliveryDate.setDate(startDeliveryDate.getDate() + 1);
                                            if (startDeliveryDate.getDay() !== 0 && startDeliveryDate.getDay() !== 6) {
                                                daysToAdd--;
                                            }
                                        }

                                        // Setting the endDeliveryDate to be the same as startDeliveryDate
                                        endDeliveryDate = new Date(startDeliveryDate);

                                        // Adding an extra working day
                                        do {
                                            endDeliveryDate.setDate(endDeliveryDate.getDate() + 1);
                                        } while (endDeliveryDate.getDay() === 0 || endDeliveryDate.getDay() === 6);

                                        return { start: startDeliveryDate, end: endDeliveryDate };
                                    }

                                    function useShippingDays() {
                                        console.log("useShippingDays called with shipping_days: ", shipping_days, " and shipping_days_express: ", shipping_days_express, "pr_quantity: ", pr_quantity);
                                        if (shipping_days === undefined || shipping_days === null || shipping_days === "" || isNaN(shipping_days)) {
                                            $('#shipping_days_shipping .shipping_days').html('Κατόπιν επικοινωνίας');
                                            $('#shipping_days_express_shipping .shipping_days_express').html('Κατόπιν επικοινωνίας');
                                        } else {
                                            if (brand == 'kits') {
                                                if ((pr_quantity >= 1) && (pr_quantity < 2500)) {
                                                    function formatDateRange(dates) {
                                                        var startWeekday = dates.start.toLocaleString('el-GR', { weekday: 'short' });
                                                        var startMonth = dates.start.getMonth() + 1;
                                                        var startDay = dates.start.getDate();
                                                        var endWeekday = dates.end.toLocaleString('el-GR', { weekday: 'short' });
                                                        var endMonth = dates.end.getMonth() + 1;
                                                        var endDay = dates.end.getDate();
                                                        return `${startWeekday} ${startDay}/${startMonth} - ${endWeekday} ${endDay}/${endMonth}`;
                                                    }
                                                    var regularDates = addShippingDaysWithRange(new Date(), shipping_days);
                                                    var regularDateFormatted = formatDateRange(regularDates);
                                                    var expressDates = addShippingDaysWithRange(new Date(), shipping_days_express);
                                                    var expressDateFormatted = formatDateRange(expressDates);

                                                    $('#shipping_days_shipping .shipping_days').html('' + regularDateFormatted + '.');
                                                    $('#shipping_days_express_shipping .shipping_days_express').html('Κατόπιν επικοινωνίας');
                                                } else if ((pr_quantity >= 2500)) {
                                                    $('#shipping_days_shipping .shipping_days').html('Κατόπιν επικοινωνίας');
                                                    $('#shipping_days_express_shipping .shipping_days_express').html('Κατόπιν επικοινωνίας');
                                                }                                                
                                            } else {
                                                if ((pr_quantity >= 1) && (pr_quantity < 2500)) {
                                                    function formatDateRange(dates) {
                                                        var startWeekday = dates.start.toLocaleString('el-GR', { weekday: 'short' });
                                                        var startMonth = dates.start.getMonth() + 1;
                                                        var startDay = dates.start.getDate();
                                                        var endWeekday = dates.end.toLocaleString('el-GR', { weekday: 'short' });
                                                        var endMonth = dates.end.getMonth() + 1;
                                                        var endDay = dates.end.getDate();
                                                        return `${startWeekday} ${startDay}/${startMonth} - ${endWeekday} ${endDay}/${endMonth}`;
                                                    }
                                                    var regularDates = addShippingDaysWithRange(new Date(), shipping_days);
                                                    var regularDateFormatted = formatDateRange(regularDates);
                                                    var expressDates = addShippingDaysWithRange(new Date(), shipping_days_express);
                                                    var expressDateFormatted = formatDateRange(expressDates);

                                                    $('#shipping_days_shipping .shipping_days').html('' + regularDateFormatted + '.');
                                                    $('#shipping_days_express_shipping .shipping_days_express').html('' + expressDateFormatted + '. ');
                                                } else if ((pr_quantity >= 2500)) {
                                                    $('#shipping_days_shipping .shipping_days').html('Κατόπιν επικοινωνίας');
                                                    $('#shipping_days_express_shipping .shipping_days_express').html('Κατόπιν επικοινωνίας');
                                                }
                                            }
                                        }
                                    }


                                    
                                    //SHIPPING COSTS
                                    var big = '<?php the_field('v1_w1'); ?>';
                                    var sum_big = big * pr_quantity;
                                    var rounded_sum_big = Math.ceil(sum_big);
                                    let expressShippingCost = 0;

                                    //SHIPPING COSTS FOR MIDOCEAN
                                    if (brand == 'Midocean') {
                                        if (big <= 0) {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            $('#shipping_days_express_shipping .shipping_cost_express').html('Επικοινωνήστε μαζί μας');
                                        } else {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            if ((rounded_sum_big > 0) && (rounded_sum_big <= 1)) {
                                                expressShippingCost = 15.08;
                                            } else if ((rounded_sum_big > 1) && (rounded_sum_big <= 5)) {
                                                var result = ((rounded_sum_big - 1) * 5.32 + 15.75);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 5) && (rounded_sum_big <= 10)) {
                                                var result = ((rounded_sum_big - 5) * 3.41 + 36.86);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 10) && (rounded_sum_big <= 20)) {
                                                var result = ((rounded_sum_big - 10) * 1.21 + 53.91);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 20) && (rounded_sum_big <= 30)) {
                                                var result = ((rounded_sum_big - 20) * 1.89 + 66.01);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 30) && (rounded_sum_big <= 70)) {
                                                var result = ((rounded_sum_big - 30) * 3.32 + 105.52);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 70) && (rounded_sum_big <= 100)) {
                                                var result = ((rounded_sum_big - 70) * 5.63 + 251.37);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 100)) {
                                                var result = ((rounded_sum_big - 100) * 7.23 + 420.03);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            }
                                        }
                                        //var formattedResult = expressShippingCost.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        //$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResult);
                                        /*var formattedResult = expressShippingCost / pr_quantity;
                                        var formattedResultPiece = formattedResult.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        $('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');*/
										var formattedResult = expressShippingCost / pr_quantity;
										var formattedResultPiece = (Math.ceil(formattedResult * 100) / 100).toLocaleString('el-GR', { minimumFractionDigits: 2 });
										$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');

                                    } else if (brand == 'Xindao') {
                                        if (big <= 0) {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            $('#shipping_days_express_shipping .shipping_cost_express').html('Επικοινωνήστε μαζί μας');
                                        } else {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            if ((rounded_sum_big > 0) && (rounded_sum_big <= 1)) {
                                                expressShippingCost = 15.08;
                                            } else if ((rounded_sum_big > 1) && (rounded_sum_big <= 5)) {
                                                var result = ((rounded_sum_big - 1) * 5.05 + 15.08);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            } else if ((rounded_sum_big > 5) && (rounded_sum_big <= 10)) {
                                                var result = ((rounded_sum_big - 5) * 3.27 + 35.29);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            } else if ((rounded_sum_big > 10) && (rounded_sum_big <= 20)) {
                                                var result = ((rounded_sum_big - 10) * 1.16 + 51.62);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            } else if ((rounded_sum_big > 20) && (rounded_sum_big <= 30)) {
                                                var result = ((rounded_sum_big - 20) * 1.81 + 63.19);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            } else if ((rounded_sum_big > 30) && (rounded_sum_big <= 70)) {
                                                var result = ((rounded_sum_big - 30) * 3.17 + 101.03);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            } else if ((rounded_sum_big > 70) && (rounded_sum_big <= 100)) {
                                                var result = ((rounded_sum_big - 70) * 5.38 + 240.67);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            } else if ((rounded_sum_big > 100)) {
                                                var result = ((rounded_sum_big - 100) * 6.93 + 402.11);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult * 0.4;
                                            }
                                        }
                                        //var formattedResult = expressShippingCost.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        //$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResult);
                                        /*var formattedResult = expressShippingCost / pr_quantity;
                                        var formattedResultPiece = formattedResult.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        $('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');*/
										var formattedResult = expressShippingCost / pr_quantity;
										var formattedResultPiece = (Math.ceil(formattedResult * 100) / 100).toLocaleString('el-GR', { minimumFractionDigits: 2 });
										$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');
                                    } else if (brand == 'PF') 
                                    {
                                        if (big <= 0) {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            $('#shipping_days_express_shipping .shipping_cost_express').html('Επικοινωνήστε μαζί μας');
                                        } else {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            if ((rounded_sum_big > 0) && (rounded_sum_big <= 1)) {
                                                expressShippingCost = 15.08;
                                            } else if ((rounded_sum_big > 1) && (rounded_sum_big < 2)) {
                                                var result = 16;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big >= 2) && (rounded_sum_big < 3)) {
                                                var result = 16.84;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big >= 3) && (rounded_sum_big < 6)) {
                                                var result = ((rounded_sum_big - 2) * 3.18 + 16.84);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big >= 6) && (rounded_sum_big < 11)) {
                                                var result = ((rounded_sum_big - 5) * 3.38 + 26.38);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big >= 11) && (rounded_sum_big < 31)) {
                                                var result = ((rounded_sum_big - 10) * 4.2 + 43.28);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big >= 31) && (rounded_sum_big < 51)) {
                                                var result = ((rounded_sum_big - 30) * 3.99 + 127.28);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big >= 51)) {
                                                var result = ((rounded_sum_big - 50) * 4.44 + 207.08);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            }
                                        }
                                        //var formattedResult = expressShippingCost.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        //$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResult);
                                        /*var formattedResult = expressShippingCost / pr_quantity;
                                        var formattedResultPiece = formattedResult.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        $('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');*/
										var formattedResult = expressShippingCost / pr_quantity;
										var formattedResultPiece = (Math.ceil(formattedResult * 100) / 100).toLocaleString('el-GR', { minimumFractionDigits: 2 });
										$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');
                                    } else if (brand == 'Stricker') {
                                        if (big <= 0) {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            $('#shipping_days_express_shipping .shipping_cost_express').html('Επικοινωνήστε μαζί μας');
                                        } else {
                                            $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                            if ((rounded_sum_big > 0) && (rounded_sum_big <= 1)) {
                                                expressShippingCost = 15.08;
                                            } else if ((rounded_sum_big > 0) && (rounded_sum_big <= 1.5)) {
                                                var result = 5;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 1.5) && (rounded_sum_big <= 5)) {
                                                var result = 15;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 5) && (rounded_sum_big <= 6)) {
                                                var result = 29.42;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 6) && (rounded_sum_big <= 7)) {
                                                var result = 34.33;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 7) && (rounded_sum_big <= 8)) {
                                                var result = 39.23;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 8) && (rounded_sum_big <= 9)) {
                                                var result = 44.14;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 9) && (rounded_sum_big <= 10)) {
                                                var result = 49.04;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 10) && (rounded_sum_big <= 11)) {
                                                var result = 52.64;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 11) && (rounded_sum_big <= 12)) {
                                                var result = 56.23;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 12) && (rounded_sum_big <= 13)) {
                                                var result = 59.83;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 13) && (rounded_sum_big <= 14)) {
                                                var result = 63.43;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 14) && (rounded_sum_big <= 15)) {
                                                var result = 67.02;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 15) && (rounded_sum_big <= 16)) {
                                                var result = 70.62;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 16) && (rounded_sum_big <= 18)) {
                                                var result = 77.81;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 18) && (rounded_sum_big <= 20)) {
                                                var result = 85.01;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 20) && (rounded_sum_big <= 22)) {
                                                var result = 91.54;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 22) && (rounded_sum_big <= 24)) {
                                                var result = 98.08;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 24) && (rounded_sum_big <= 26)) {
                                                var result = 104.62;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 26) && (rounded_sum_big <= 28)) {
                                                var result = 111.16;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 28) && (rounded_sum_big <= 30)) {
                                                var result = 117.70;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 30) && (rounded_sum_big <= 35)) {
                                                var result = 189.62;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 35) && (rounded_sum_big <= 40)) {
                                                var result = 261.55;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 40) && (rounded_sum_big <= 45)) {
                                                var result = 294.24;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 45) && (rounded_sum_big <= 50)) {
                                                var result = 326.94;
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            } else if ((rounded_sum_big > 50)) {
                                                var result = ((rounded_sum_big - 50) * 6.54 + 326.94);
                                                var roundedResult = Math.round(result * 100) / 100;
                                                expressShippingCost = roundedResult;
                                            }
                                        }
										/*var formattedResult = expressShippingCost / pr_quantity;
                                        var formattedResultPiece = formattedResult.toLocaleString('el-GR', { minimumFractionDigits: 2 });
                                        $('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');*/
										var formattedResult = expressShippingCost / pr_quantity;
										var formattedResultPiece = (Math.ceil(formattedResult * 100) / 100).toLocaleString('el-GR', { minimumFractionDigits: 2 });
										$('#shipping_days_express_shipping .shipping_cost_express').html('+' + formattedResultPiece + ' / τεμάχιο');
                                    } else {
                                      $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
                                      $('#shipping_days_express_shipping .shipping_cost_express').html('Επικοινωνήστε μαζί μας');
                                    }

                                    //SHIPPING COSTS
                                    function updatePriceDisplay(finalCost = 0) {
                                        if (finalCost) {
                                            <?php if (current_user_can('administrator')) { ?>
                                                //$('#price_cart_total_cus .cart_total_cus').html(finalCost.toFixed(2) + ' ' + obj.currency);
                                                $('#price_cart_total_cus .cart_total_cus').html(finalCost.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + obj.currency);
                                            <?php } else { ?>
                                                //$('#price_cart_total .cart_total').html(finalCost.toFixed(2) + ' ' + obj.currency);
                                                $('#price_cart_total .cart_total').html(finalCost.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + obj.currency);
                                            <?php } ?>
                                        }
                                        <?php if (current_user_can('administrator')) { ?>
                                            var cartPriceDisplay = cart_per_total.toFixed(2) + ' ' + obj.currency;
                                            //$('#price_per_product_price .price_per_product').html(cartPriceDisplay);
                                            $('#price_per_product_price_customer .price_per_product_customer').html(cartPriceDisplay);
                                            $('#price_per_product_price_front_customer .price_per_product_front_customer').html(cartPriceDisplay);
                                        <?php } else { ?>
                                            var cartPriceDisplay = cart_per_total.toFixed(2) + ' ' + obj.currency;
                                            $('#price_per_product_price .price_per_product').html(cartPriceDisplay);
                                        <?php } ?>
                                    }

                                    $('.shipping_days_shipping_img').addClass('active-bg');

                                    var originalPrice = cart_per_total;
                                    var lastClickedShippingOption = 'shipping_days_shipping_img';

                                    updatePriceDisplay();

                                    $('.shipping_days_shipping_img, .shipping_days_express_shipping_img').on('click', function() {
                                        // if ($(this).hasClass('active-bg')) {
                                        //     return;
                                        // }
                                        let finalCost = 0;
                                        if ($(this).hasClass('shipping_days_shipping_img')) {
                                            // cart_per_total = originalPrice; // Set to the original price
                                            finalCost = cartTotal;
                                            cart_per_total = finalCost ? finalCost / pr_quantity : cart_per_total;
                                            $('.shipping_days_express_shipping_img').removeClass('active-bg');
                                        } else {
                                            // cart_per_total = originalPrice + 15; // Add 15 to the original price
                                            finalCost = cartTotal + expressShippingCost;
                                            cart_per_total = finalCost ? finalCost / pr_quantity : cart_per_total;
                                            $('.shipping_days_shipping_img').removeClass('active-bg');
                                        }

                                        updatePriceDisplay(finalCost);
                                        $(this).addClass('active-bg');

                                        // USE THIS TO DETERMINE IF THE USER HAS CHOSEN THE EXPRESS SHIPPING AND UPDATE THE HIDDEN INPUT "express_shipping_selected" TO DISPLAY THE COST IN THE CART
                                        let expressShippingSelected = $('.shipping_days_express_shipping_img').hasClass('active-bg') ? 'yes' : 'no';
                                        $('#express_shipping_selected_input').val(expressShippingSelected);

                                        lastClickedShippingOption = $(this).hasClass('shipping_days_shipping_img') ? 'shipping_days_shipping_img' : 'shipping_days_express_shipping_img';
                                    });

                                    function handleQuantityChange() {
                                        updatePriceDisplay();

                                        $('.shipping_days_shipping_img, .shipping_days_express_shipping_img').removeClass('active-bg');
                                        $('.' + lastClickedShippingOption).addClass('active-bg');
                                    }

                                    $('input[name="quantity"]').on('change', handleQuantityChange);



                                    //PRICES FOR ADMINISTRATOR "ΤΙΜΗ ΠΕΛΑΤΗ ΑΝΑ ΠΡΟΪΟΝ"
                                    <?php if (current_user_can('administrator')) {?>
                                        var cart_total_customer = parseFloat(price_product_price_customer + price_print_price_customer + price_print_setup_customer + manipulation_product_total || 0);
                                        //$('#price_cart_total_customer .cart_total_customer').html(cart_total_customer.toFixed(2) + ' ' + obj.currency);
                                        $('#price_cart_total_customer .cart_total_customer').html(cart_total_customer.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + obj.currency);

                                        var cart_per_total = parseFloat(cart_total / pr_quantity || 0);
                                        $('#price_per_product_price .price_per_product').html( cart_per_total.toFixed(2) + ' ' + obj.currency);

                                        var cart_per_total_customer = parseFloat(cart_total_customer / pr_quantity || 0);
                                        $('#price_per_product_price_customer .price_per_product_customer').html( cart_per_total_customer.toFixed(2) + ' ' + obj.currency);

                                        var cart_per_total_customer = parseFloat(cart_total_customer / pr_quantity || 0);
                                        $('#price_per_product_price_front_customer .price_per_product_front_customer').html( cart_per_total_customer.toFixed(2) + ' ' + obj.currency);
                                    <?php } ?>
                                    // END PRICES FOR ADMINISTRATOR "ΤΙΜΗ ΠΕΛΑΤΗ ΑΝΑ ΠΡΟΪΟΝ"

                                    //PRINTING INFO DIV
                                    $('#info .printing_size').html();
                                    var max_printing_size = obj.max_printing_size;
                                    $('#max_printing_size .printing_size').html(max_printing_size);

                                    //PRINTING INFO TECH DIV
                                    $('#info_tech .printing_technique').html();
                                    var printing_technique_field = obj.printing_technique_field;
                                    $('#printing_technique_field .printing_technique').html(printing_technique_field);

                                    //TABLE PRICE DIV PRICES
                                <?php if (current_user_can('administrator')) {?>

                                    window.price_print_setup = price_print_setup;
                                    if (brand == 'kits') {
                                        var price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier);
                                    } else {
                                        var price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier + 30);
                                    }
                                    //var price_print_setup_customer;

                                    /*// Function to calculate the price based on the active swatch
                                    function handleSwatchSelectionNoprint(activeSwatchValue) {
                                        //console.log("Active swatch value Setup:", activeSwatchValue); // Debug log
                                        if (activeSwatchValue === 'no-print') {
                                            price_print_setup_customer = parseFloat(obj.price_print_setup);
                                        } else {
                                            price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier + 30);
                                        }
                                        //console.log("Calculated price_print_setup_customer:", price_print_setup_customer);
                                        // Update the display or perform further actions with the calculated price
                                        updatePriceDisplay(price_print_setup_customer);
                                    }*/
                                    var manipulation_price = '<?php the_field('manipulation'); ?>';

                                    var product_price1 = price * 1;
                                    var price_print_price1 = parseFloat(obj.price_print_1_3 * 1);
                                    var manipulation_product_total1 = parseFloat(manipulation_price * 1);
                                    var cart_total = parseFloat(product_price1 + price_print_price1 + price_print_setup + manipulation_product_total1 || 0);
                                    var cart_per_total1 = parseFloat(cart_total / 1 || 0);
                                    $('#table_price .tg_price1, #table_price_dropdown .tg_price1').html(cart_per_total1.toFixed(2) + ' ' +obj.currency);

                                    var product_price2 = price * 2;
                                    var price_print_price2 = parseFloat(obj.price_print_1_3 * 2);
                                    var manipulation_product_total2 = parseFloat(manipulation_price * 2);
                                    var cart_total = parseFloat(product_price2 + price_print_price2 + price_print_setup + manipulation_product_total2 || 0);
                                    var cart_per_total2 = parseFloat(cart_total / 2 || 0);
                                    $('#table_price .tg_price2, #table_price_dropdown .tg_price2').html(cart_per_total2.toFixed(2) + ' ' +obj.currency);

                                    var product_price5 = price * 5;
                                    var price_print_price5 = parseFloat(obj.price_print_5_10 * 5);
                                    var manipulation_product_total5 = parseFloat(manipulation_price * 5);
                                    var cart_total = parseFloat(product_price5 + price_print_price5 + price_print_setup + manipulation_product_total5 || 0);
                                    var cart_per_total5 = parseFloat(cart_total / 5 || 0);
                                    $('#table_price .tg_price5, #table_price_dropdown .tg_price5').html(cart_per_total5.toFixed(2) + ' ' +obj.currency);

                                    var product_price10 = price * 10;
                                    var price_print_price10 = parseFloat(obj.price_print_10_25 * 10);
                                    var manipulation_product_total10 = parseFloat(manipulation_price * 10);
                                    var cart_total = parseFloat(product_price10 + price_print_price10 + price_print_setup + manipulation_product_total10 || 0);
                                    var cart_per_total10 = parseFloat(cart_total / 10 || 0);
                                    $('#table_price .tg_price10, #table_price_dropdown .tg_price10').html(cart_per_total10.toFixed(2) + ' ' +obj.currency);

                                    var product_price50 = price * 50;
                                    var price_print_price50 = parseFloat(obj.price_print_50_100 * 50);
                                    var manipulation_product_total50 = parseFloat(manipulation_price * 50);
                                    var cart_total = parseFloat(product_price50 + price_print_price50 + price_print_setup + manipulation_product_total50 || 0);
                                    var cart_per_total50 = parseFloat(cart_total / 50 || 0);
                                    $('#table_price .tg_price50, #table_price_dropdown .tg_price50').html(cart_per_total50.toFixed(2) + ' ' +obj.currency);

                                    var product_price100 = price * 100;
                                    var price_print_price100 = parseFloat(obj.price_print_100_250 * 100);
                                    var manipulation_product_total100 = parseFloat(manipulation_price *100);
                                    var cart_total = parseFloat(product_price100 + price_print_price100 + price_print_setup + manipulation_product_total100 || 0);
                                    var cart_per_total100 = parseFloat(cart_total / 100 || 0);
                                    $('#table_price .tg_price100, #table_price_dropdown .tg_price100').html(cart_per_total100.toFixed(2) + ' ' + obj.currency);

                                    var product_price250 = price * 250;
                                    var price_print_price250 = parseFloat(obj.price_print_250_500 * 250);
                                    var manipulation_product_total250 = parseFloat(manipulation_price * 250);
                                    var cart_total = parseFloat(product_price250 + price_print_price250 + price_print_setup + manipulation_product_total250 || 0);
                                    var cart_per_total250 = parseFloat(cart_total / 250 || 0);
                                    $('#table_price .tg_price250, #table_price_dropdown .tg_price250').html(cart_per_total250.toFixed(2) + ' ' + obj.currency);

                                    var product_price500 = price * 500;
                                    var price_print_price500 = parseFloat(obj.price_print_500_1000 * 500);
                                    var manipulation_product_total500 = parseFloat(manipulation_price * 500);
                                    var cart_total = parseFloat(product_price500 + price_print_price500 + price_print_setup + manipulation_product_total500 || 0);
                                    var cart_per_total500 = parseFloat(cart_total / 500 || 0);
                                    $('#table_price .tg_price500, #table_price_dropdown .tg_price500').html(cart_per_total500.toFixed(2) + ' ' + obj.currency);

                                    var product_price1000 = price * 1000;
                                    var price_print_price1000 = parseFloat(obj.price_print_1000_2500 * 1000);
                                    var manipulation_product_total1000 = parseFloat(manipulation_price * 1000);
                                    var cart_total = parseFloat(product_price1000 + price_print_price1000 + price_print_setup + manipulation_product_total1000 || 0);
                                    var cart_per_total1000 = parseFloat(cart_total / 1000 || 0);
                                    $('#table_price .tg_price1000, #table_price_dropdown .tg_price1000').html(cart_per_total1000.toFixed(2) +' ' + obj.currency);

                                    var product_price2500 = price * 2500;
                                    var price_print_price2500 = parseFloat(obj.price_print_2500_5000 *2500);
                                    var manipulation_product_total2500 = parseFloat(manipulation_price *2500);
                                    var cart_total = parseFloat(product_price2500 + price_print_price2500 + price_print_setup + manipulation_product_total2500 || 0);
                                    var cart_per_total2500 = parseFloat(cart_total / 2500 || 0);
                                    $('#table_price .tg_price2500, #table_price_dropdown .tg_price2500').html(cart_per_total2500.toFixed(2) +' ' + obj.currency);

                                    var product_price5000 = price * 5000;
                                    var price_print_price5000 = parseFloat(obj.price_print_5000_10000 * 5000);
                                    var manipulation_product_total5000 = parseFloat(manipulation_price * 5000);
                                    var cart_total = parseFloat(product_price5000 + price_print_price5000 + price_print_setup + manipulation_product_total5000 || 0);
                                    var cart_per_total5000 = parseFloat(cart_total / 5000 || 0);
                                    $('#table_price .tg_price5000, #table_price_dropdown .tg_price5000').html(cart_per_total5000.toFixed(2) + ' ' + obj.currency);

                                    var product_price10000 = price * 10000;
                                    var price_print_price10000 = parseFloat(obj.price_print_10000_infinity * 10000);
                                    var manipulation_product_total10000 = parseFloat(manipulation_price * 10000);
                                    var cart_total = parseFloat(product_price10000 + price_print_price10000 + price_print_setup + manipulation_product_total10000 || 0);
                                    var cart_per_total10000 = parseFloat(cart_total / 10000 || 0);
                                    $('#table_price .tg_price10000, #table_price_dropdown .tg_price10000').html(cart_per_total10000.toFixed(2) + ' ' + obj.currency);

                                    //PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                                    var manipulation_price_customer = '<?php the_field('manipulation'); ?>';

                                    var product_price1_customer = price_customer_1 * 1;
                                    var price_print_price1_customer = price_print_1_3_customer * 1;
                                    var manipulation_product_total_customer1 = parseFloat( manipulation_price_customer * 1);
                                    var cart_total_customer = parseFloat(product_price1_customer + price_print_price1_customer + price_print_setup_customer + manipulation_product_total_customer1 || 0);
                                    var cart_per_total1_customer = parseFloat(cart_total_customer / 1 || 0);
                                    $('#table_price_customer .tg_price1_customer, #table_price_customer_dropdown .tg_price1_customer').html( cart_per_total1_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price2_customer = price_customer_2 * 2;
                                    var price_print_price2_customer = price_print_1_3_customer * 2;
                                    var manipulation_product_total_customer2 = parseFloat( manipulation_price_customer * 2);
                                    var cart_total_customer = parseFloat(product_price2_customer + price_print_price2_customer + price_print_setup_customer + manipulation_product_total_customer2 || 0);
                                    var cart_per_total2_customer = parseFloat(cart_total_customer / 2 || 0);
                                    $('#table_price_customer .tg_price2_customer, #table_price_customer_dropdown .tg_price2_customer').html( cart_per_total2_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price5_customer = price_customer_5 * 5;
                                    var price_print_price5_customer = price_print_5_10_customer * 5;
                                    var manipulation_product_total_customer5 = parseFloat( manipulation_price_customer * 5);
                                    var cart_total_customer = parseFloat(product_price5_customer + price_print_price5_customer + price_print_setup_customer + manipulation_product_total_customer5 || 0);
                                    var cart_per_total5_customer = parseFloat(cart_total_customer / 5 || 0);
                                    $('#table_price_customer .tg_price5_customer, #table_price_customer_dropdown .tg_price5_customer').html( cart_per_total5_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price10_customer = price_customer_10 * 10;
                                    var price_print_price10_customer = price_print_10_25_customer * 10;
                                    var manipulation_product_total_customer10 = parseFloat( manipulation_price_customer * 10);
                                    var cart_total_customer = parseFloat(product_price10_customer + price_print_price10_customer + price_print_setup_customer + manipulation_product_total_customer10 || 0);
                                    var cart_per_total10_customer = parseFloat(cart_total_customer / 10 || 0);
                                    $('#table_price_customer .tg_price10_customer, #table_price_customer_dropdown .tg_price10_customer').html( cart_per_total10_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price50_customer = price_customer_50 * 50;
                                    var price_print_price50_customer = price_print_50_100_customer * 50;
                                    var manipulation_product_total_customer50 = parseFloat( manipulation_price_customer * 50);
                                    var cart_total_customer = parseFloat(product_price50_customer + price_print_price50_customer + price_print_setup_customer + manipulation_product_total_customer50 || 0);

                                    var cart_per_total50_customer = parseFloat(cart_total_customer / 50 || 0);
                                    $('#table_price_customer .tg_price50_customer, #table_price_customer_dropdown .tg_price50_customer').html( cart_per_total50_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price100_customer = price_customer_100 * 100;
                                    var price_print_price100_customer = price_print_100_250_customer * 100;
                                    var manipulation_product_total_customer100 = parseFloat( manipulation_price_customer * 100);
                                    //console.debug(product_price100_customer , price_print_price100_customer , price_print_setup , manipulation_product_total_customer100 );
                                    var cart_total_customer = parseFloat(product_price100_customer + price_print_price100_customer + price_print_setup_customer + manipulation_product_total_customer100 || 0);
                                    var cart_per_total100_customer = parseFloat(cart_total_customer / 100 || 0);
                                    $('#table_price_customer .tg_price100_customer, #table_price_customer_dropdown .tg_price100_customer').html( cart_per_total100_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price250_customer = price_customer_250 * 250;
                                    var price_print_price250_customer = price_print_250_500_customer * 250;
                                    var manipulation_product_total_customer250 = parseFloat( manipulation_price_customer * 250);
                                    var cart_total_customer = parseFloat(product_price250_customer + price_print_price250_customer + price_print_setup_customer + manipulation_product_total_customer250 || 0);
                                    var cart_per_total250_customer = parseFloat(cart_total_customer / 250 || 0);
                                    $('#table_price_customer .tg_price250_customer, #table_price_customer_dropdown .tg_price250_customer').html( cart_per_total250_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price500_customer = price_customer_500 * 500;
                                    var price_print_price500_customer = price_print_500_1000_customer * 500;
                                    var manipulation_product_total_customer500 = parseFloat( manipulation_price_customer * 500);
                                    var cart_total_customer = parseFloat(product_price500_customer + price_print_price500_customer + price_print_setup_customer + manipulation_product_total_customer500 || 0);
                                    var cart_per_total500_customer = parseFloat(cart_total_customer / 500 || 0);
                                    $('#table_price_customer .tg_price500_customer, #table_price_customer_dropdown .tg_price500_customer').html(cart_per_total500_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price1000_customer = price_customer_1000 * 1000;
                                    var price_print_price1000_customer = price_print_1000_2500_customer * 1000;
                                    var manipulation_product_total_customer1000 = parseFloat(manipulation_price_customer * 1000);
                                    var cart_total_customer = parseFloat(product_price1000_customer + price_print_price1000_customer + price_print_setup_customer + manipulation_product_total_customer1000 || 0);
                                    var cart_per_total1000_customer = parseFloat(cart_total_customer / 1000 || 0);
                                    $('#table_price_customer .tg_price1000_customer, #table_price_customer_dropdown .tg_price1000_customer').html(cart_per_total1000_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price2500_customer = price_customer_2500 * 2500;
                                    var price_print_price2500_customer = price_print_2500_5000_customer * 2500;
                                    var manipulation_product_total_customer2500 = parseFloat(manipulation_price_customer * 2500);
                                    var cart_total_customer = parseFloat(product_price2500_customer + price_print_price2500_customer + price_print_setup_customer + manipulation_product_total_customer2500 || 0);
                                    var cart_per_total2500_customer = parseFloat(cart_total_customer / 2500 || 0);
                                    $('#table_price_customer .tg_price2500_customer, #table_price_customer_dropdown .tg_price2500_customer').html(cart_per_total2500_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price5000_customer = price_customer_5000 * 5000;
                                    var price_print_price5000_customer = price_print_5000_10000_customer * 5000;
                                    var manipulation_product_total_customer5000 = parseFloat(manipulation_price_customer * 5000);
                                    var cart_total_customer = parseFloat(product_price5000_customer + price_print_price5000_customer + price_print_setup_customer + manipulation_product_total_customer5000 || 0);
                                    var cart_per_total5000_customer = parseFloat(cart_total_customer / 5000 || 0);
                                    $('#table_price_customer .tg_price5000_customer, #table_price_customer_dropdown .tg_price5000_customer').html(cart_per_total5000_customer.toFixed(2) + ' ' + obj.currency);

                                    var product_price10000_customer = price_customer_10000 * 10000;
                                    var price_print_price10000_customer = price_print_10000_infinity_customer * 10000;
                                    var manipulation_product_total_customer10000 = parseFloat(manipulation_price_customer * 10000);
                                    var cart_total_customer = parseFloat(product_price10000_customer + price_print_price10000_customer + price_print_setup_customer + manipulation_product_total_customer10000 || 0);
                                    var cart_per_total10000_customer = parseFloat(cart_total_customer / 10000 || 0);
                                    $('#table_price_customer .tg_price10000_customer, #table_price_customer_dropdown .tg_price10000_customer').html(cart_per_total10000_customer.toFixed(2) + ' ' + obj.currency);
                                    //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"

                                    <?php } else { ?>

                                    window.price_print_setup = price_print_setup;
                                    if (brand == 'kits') {
                                        var price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier);
                                    } else {
                                        var price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier + 30);
                                    }
                                    //var price_print_setup_customer;

                                    /*// Function to calculate the price based on the active swatch
                                    function handleSwatchSelectionNoprint(activeSwatchValue) {
                                        //console.log("Active swatch value Setup:", activeSwatchValue); // Debug log
                                        if (activeSwatchValue === 'no-print') {
                                            price_print_setup_customer = parseFloat(obj.price_print_setup);
                                        } else {
                                            price_print_setup_customer = parseFloat(obj.price_print_setup * printMultiplier + 30);
                                        }
                                        //console.log("Calculated price_print_setup_customer:", price_print_setup_customer);
                                        // Update the display or perform further actions with the calculated price
                                        updatePriceDisplay(price_print_setup_customer);
                                    }*/
                                    var manipulation_price = '<?php the_field('manipulation'); ?>';

                                    var product_price1 = price_customer_1 * 1;
                                    var price_print_price1 = price_print_1_3_customer *1;
                                    var manipulation_product_total1 = parseFloat(manipulation_price * 1);
                                    var cart_total = parseFloat(product_price1 + price_print_price1 + price_print_setup_customer + manipulation_product_total1 || 0);
                                    var cart_per_total1 = parseFloat(cart_total / 1 || 0);
                                    $('#table_price .tg_price1, #table_price_dropdown .tg_price1').html(cart_per_total1.toFixed(2) + ' ' + obj.currency);

                                    var product_price2 = price_customer_2 * 2;
                                    var price_print_price2 = price_print_1_3_customer *2;
                                    var manipulation_product_total2 = parseFloat(manipulation_price * 2);
                                    var cart_total = parseFloat(product_price2 + price_print_price2 + price_print_setup_customer + manipulation_product_total2 || 0);
                                    var cart_per_total2 = parseFloat(cart_total / 2 || 0);
                                    $('#table_price .tg_price2, #table_price_dropdown .tg_price2').html(cart_per_total2.toFixed(2) + ' ' + obj.currency);

                                    var product_price5 = price_customer_5 * 5;
                                    var price_print_price5 = price_print_5_10_customer *5;
                                    var manipulation_product_total5 = parseFloat(manipulation_price * 5);
                                    var cart_total = parseFloat(product_price5 + price_print_price5 + price_print_setup_customer + manipulation_product_total5 || 0);
                                    var cart_per_total5 = parseFloat(cart_total / 5 || 0);
                                    $('#table_price .tg_price5, #table_price_dropdown .tg_price5').html(cart_per_total5.toFixed(2) + ' ' + obj.currency);

                                    var product_price10 = price_customer_10 * 10;
                                    var price_print_price10 = price_print_10_25_customer *10;
                                    var manipulation_product_total10 = parseFloat(manipulation_price * 10);
                                    var cart_total = parseFloat(product_price10 + price_print_price10 + price_print_setup_customer + manipulation_product_total10 || 0);
                                    var cart_per_total10 = parseFloat(cart_total / 10 || 0);
                                    $('#table_price .tg_price10, #table_price_dropdown .tg_price10').html(cart_per_total10.toFixed(2) + ' ' + obj.currency);

                                    var product_price50 = price_customer_50 * 50;
                                    var price_print_price50 = price_print_50_100_customer *50;
                                    var manipulation_product_total50 = parseFloat(manipulation_price * 50);
                                    var cart_total = parseFloat(product_price50 + price_print_price50 + price_print_setup_customer + manipulation_product_total50 || 0);
                                    var cart_per_total50 = parseFloat(cart_total / 50 || 0);
                                    $('#table_price .tg_price50, #table_price_dropdown .tg_price50').html(cart_per_total50.toFixed(2) + ' ' + obj.currency);

                                    var product_price100 = price_customer_100 * 100;
                                    var price_print_price100 = price_print_100_250_customer * 100;
                                    var manipulation_product_total100 = parseFloat(manipulation_price * 100);
                                    var cart_total = parseFloat(product_price100 + price_print_price100 + price_print_setup_customer + manipulation_product_total100 || 0);
                                    var cart_per_total100 = parseFloat(cart_total / 100 || 0);
                                    $('#table_price .tg_price100, #table_price_dropdown .tg_price100').html(cart_per_total100.toFixed(2) + ' ' + obj.currency);

                                    var product_price250 = price_customer_250 * 250;
                                    var price_print_price250 = price_print_250_500_customer * 250;
                                    var manipulation_product_total250 = parseFloat(manipulation_price * 250);
                                    var cart_total = parseFloat(product_price250 + price_print_price250 + price_print_setup_customer + manipulation_product_total250 || 0);
                                    var cart_per_total250 = parseFloat(cart_total / 250 || 0);
                                    $('#table_price .tg_price250, #table_price_dropdown .tg_price250').html(cart_per_total250.toFixed(2) + ' ' + obj.currency);

                                    var product_price500 = price_customer_500 * 500;
                                    var price_print_price500 = price_print_500_1000_customer * 500;
                                    var manipulation_product_total500 = parseFloat(manipulation_price * 500);
                                    var cart_total = parseFloat(product_price500 + price_print_price500 + price_print_setup_customer + manipulation_product_total500 || 0);
                                    var cart_per_total500 = parseFloat(cart_total / 500 || 0);
                                    $('#table_price .tg_price500, #table_price_dropdown .tg_price500').html(cart_per_total500.toFixed(2) + ' ' + obj.currency);

                                    var product_price1000 = price_customer_1000 * 1000;
                                    var price_print_price1000 = price_print_1000_2500_customer * 1000;
                                    var manipulation_product_total1000 = parseFloat(manipulation_price * 1000);
                                    var cart_total = parseFloat(product_price1000 + price_print_price1000 + price_print_setup_customer + manipulation_product_total1000 || 0);
                                    var cart_per_total1000 = parseFloat(cart_total / 1000 || 0);
                                    $('#table_price .tg_price1000, #table_price_dropdown .tg_price1000').html(cart_per_total1000.toFixed(2) +' ' + obj.currency);

                                    var product_price2500 = price_customer_2500 * 2500;
                                    var price_print_price2500 = price_print_2500_5000_customer * 2500;
                                    var manipulation_product_total2500 = parseFloat(manipulation_price * 2500);
                                    var cart_total = parseFloat(product_price2500 + price_print_price2500 + price_print_setup_customer + manipulation_product_total2500 || 0);
                                    var cart_per_total2500 = parseFloat(cart_total / 2500 || 0);
                                    $('#table_price .tg_price2500, #table_price_dropdown .tg_price2500').html(cart_per_total2500.toFixed(2) +' ' + obj.currency);

                                    var product_price5000 = price_customer_5000 * 5000;
                                    var price_print_price5000 = price_print_5000_10000_customer * 5000;
                                    var manipulation_product_total5000 = parseFloat(manipulation_price * 5000);
                                    var cart_total = parseFloat(product_price5000 + price_print_price5000 + price_print_setup_customer + manipulation_product_total5000 || 0);
                                    var cart_per_total5000 = parseFloat(cart_total / 5000 || 0);
                                    $('#table_price .tg_price5000, #table_price_dropdown .tg_price5000').html(cart_per_total5000.toFixed(2) +' ' + obj.currency);

                                    var product_price10000 = price_customer_10000 * 10000;
                                    var price_print_price10000 = price_print_10000_infinity_customer * 10000;
                                    var manipulation_product_total10000 = parseFloat(manipulation_price * 10000);
                                    var cart_total = parseFloat(product_price10000 + price_print_price10000 + price_print_setup_customer + manipulation_product_total10000 || 0);
                                    var cart_per_total10000 = parseFloat(cart_total / 10000 || 0);
                                    $('#table_price .tg_price10000, #table_price_dropdown .tg_price10000').html(cart_per_total10000.toFixed(2) +' ' + obj.currency);

                                    <?php } ?>

                                    //TABLE PRICE DIV MARGINS
                                    var margin1 = parseFloat(cart_per_total1 - cart_per_total1 || 0);
                                    var final_margin1 = parseFloat(margin1 / cart_per_total1 * 100 || 0);
                                    $('#table_price .tg_price1_margin, #table_price_dropdown .tg_price1_margin').html(final_margin1.toFixed(1));

                                    var margin2 = parseFloat(cart_per_total2 - cart_per_total2 || 0);
                                    var final_margin2 = parseFloat(margin2 / cart_per_total2 * 100 || 0);
                                    $('#table_price .tg_price2_margin, #table_price_dropdown .tg_price2_margin').html(final_margin2.toFixed(1));

                                    var margin5 = parseFloat(cart_per_total5 - cart_per_total5 || 0);
                                    var final_margin5 = parseFloat(margin5 / cart_per_total5 * 100 || 0);
                                    $('#table_price .tg_price5_margin, #table_price_dropdown .tg_price5_margin').html(final_margin5.toFixed(1));

                                    var margin10 = parseFloat(cart_per_total10 - cart_per_total10 || 0);
                                    var final_margin10 = parseFloat(margin10 / cart_per_total10 * 100 || 0);
                                    $('#table_price .tg_price10_margin, #table_price_dropdown .tg_price10_margin').html(final_margin10.toFixed(1));

                                    var margin50 = parseFloat(cart_per_total50 - cart_per_total50 || 0);
                                    var final_margin50 = parseFloat(margin50 / cart_per_total50 * 100 || 0);
                                    $('#table_price .tg_price50_margin, #table_price_dropdown .tg_price50_margin').html(final_margin50.toFixed(1));

                                    var margin100 = parseFloat(cart_per_total50 - cart_per_total100);
                                    var final_margin100 = parseFloat(margin100 / cart_per_total50 * 100);
                                    $('#table_price .tg_price100_margin, #table_price_dropdown .tg_price100_margin').html(final_margin100.toFixed(1));

                                    var margin250 = parseFloat(cart_per_total50 - cart_per_total250);
                                    var final_margin250 = parseFloat(margin250 / cart_per_total50 * 100);
                                    $('#table_price .tg_price250_margin, #table_price_dropdown .tg_price250_margin').html(final_margin250.toFixed(1));

                                    var margin500 = parseFloat(cart_per_total50 - cart_per_total500);
                                    var final_margin500 = parseFloat(margin500 / cart_per_total50 * 100);
                                    $('#table_price .tg_price500_margin, #table_price_dropdown .tg_price500_margin').html(final_margin500.toFixed(1));

                                    var margin1000 = parseFloat(cart_per_total50 - cart_per_total1000);
                                    var final_margin1000 = parseFloat(margin1000 / cart_per_total50 * 100);
                                    $('#table_price .tg_price1000_margin, #table_price_dropdown .tg_price1000_margin').html(final_margin1000.toFixed(
                                    1));

                                    var margin2500 = parseFloat(cart_per_total50 - cart_per_total2500);
                                    var final_margin2500 = parseFloat(margin2500 / cart_per_total50 * 100);
                                    $('#table_price .tg_price2500_margin, #table_price_dropdown .tg_price2500_margin').html(final_margin2500.toFixed(
                                    1));

                                    var margin5000 = parseFloat(cart_per_total50 - cart_per_total5000);
                                    var final_margin5000 = parseFloat(margin5000 / cart_per_total50 * 100);
                                    $('#table_price .tg_price5000_margin, #table_price_dropdown .tg_price5000_margin').html(final_margin5000.toFixed(
                                    1));

                                    var margin10000 = parseFloat(cart_per_total50 - cart_per_total10000);
                                    var final_margin10000 = parseFloat(margin10000 / cart_per_total50 *
                                    100);
                                    $('#table_price .tg_price10000_margin, #table_price_dropdown .tg_price10000_margin').html(final_margin10000.toFixed(
                                    1));

                                    //PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                                    //TABLE PRICE DIV MARGINS

                                    if (!cart_per_total1_customer) {
                                    var cart_per_total1_customer = 0;
                                    }
                                    if (!cart_per_total2_customer) {
                                    var cart_per_total2_customer = 0;
                                    }
                                    if (!cart_per_total5_customer) {
                                    var cart_per_total5_customer = 0;
                                    }
                                    if (!cart_per_total10_customer) {
                                    var cart_per_total10_customer = 0;
                                    }
                                    if (!cart_per_total50_customer) {
                                    var cart_per_total50_customer = 0;
                                    }
                                    if (!cart_per_total100_customer) {
                                    var cart_per_total100_customer = 0;
                                    }
                                    if (!cart_per_total250_customer) {
                                    var cart_per_total250_customer = 0;
                                    }
                                    if (!cart_per_total500_customer) {
                                    var cart_per_total500_customer = 0;
                                    }
                                    if (!cart_per_total1000_customer) {
                                    var cart_per_total1000_customer = 0;
                                    }
                                    if (!cart_per_total2500_customer) {
                                    var cart_per_total2500_customer = 0;
                                    }
                                    if (!cart_per_total5000_customer) {
                                    var cart_per_total5000_customer = 0;
                                    }
                                    if (!cart_per_total10000_customer) {
                                    var cart_per_total10000_customer = 0;
                                    }

                                    var margin1_customer = parseFloat(cart_per_total1_customer - cart_per_total1_customer || 0);
                                    var final_margin1_customer = parseFloat(margin1_customer / cart_per_total1_customer * 100 || 0);
                                    $('#table_price_customer .tg_price1_margin_customer, #table_price_customer_dropdown .tg_price1_margin_customer').html( final_margin1_customer.toFixed(1));

                                    var margin2_customer = parseFloat(cart_per_total2_customer - cart_per_total2_customer || 0);
                                    var final_margin2_customer = parseFloat(margin2_customer / cart_per_total2_customer * 100 || 0);
                                    $('#table_price_customer .tg_price2_margin_customer, #table_price_customer_dropdown .tg_price2_margin_customer').html( final_margin2_customer.toFixed(1));

                                    var margin5_customer = parseFloat(cart_per_total5_customer - cart_per_total5_customer || 0);
                                    var final_margin5_customer = parseFloat(margin5_customer / cart_per_total5_customer * 100 || 0);
                                    $('#table_price_customer .tg_price5_margin_customer, #table_price_customer_dropdown .tg_price5_margin_customer').html( final_margin5_customer.toFixed(1));

                                    var margin10_customer = parseFloat(cart_per_total10_customer - cart_per_total10_customer || 0);
                                    var final_margin10_customer = parseFloat(margin10_customer / cart_per_total10_customer * 100 || 0);
                                    $('#table_price_customer .tg_price10_margin_customer, #table_price_customer_dropdown .tg_price10_margin_customer').html( final_margin10_customer.toFixed(1));

                                    var margin50_customer = parseFloat(cart_per_total50_customer - cart_per_total50_customer || 0);
                                    var final_margin50_customer = parseFloat(margin50_customer / cart_per_total50_customer * 100 || 0);
                                    $('#table_price_customer .tg_price50_margin_customer, #table_price_customer_dropdown .tg_price50_margin_customer').html( final_margin50_customer.toFixed(1));

                                    var margin100_customer = parseFloat(cart_per_total50_customer - cart_per_total100_customer);
                                    var final_margin100_customer = parseFloat(margin100_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price100_margin_customer, #table_price_customer_dropdown .tg_price100_margin_customer').html( final_margin100_customer.toFixed(1));

                                    var margin250_customer = parseFloat(cart_per_total50_customer - cart_per_total250_customer);
                                    var final_margin250_customer = parseFloat(margin250_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price250_margin_customer, #table_price_customer_dropdown .tg_price250_margin_customer').html(final_margin250_customer.toFixed(1));

                                    var margin500_customer = parseFloat(cart_per_total50_customer - cart_per_total500_customer);
                                    var final_margin500_customer = parseFloat(margin500_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price500_margin_customer, #table_price_customer_dropdown .tg_price500_margin_customer').html( final_margin500_customer.toFixed(1));

                                    var margin1000_customer = parseFloat(cart_per_total50_customer - cart_per_total1000_customer);
                                    var final_margin1000_customer = parseFloat(margin1000_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price1000_margin_customer, #table_price_customer_dropdown .tg_price1000_margin_customer').html( final_margin1000_customer.toFixed(1));

                                    var margin2500_customer = parseFloat(cart_per_total50_customer - cart_per_total2500_customer);
                                    var final_margin2500_customer = parseFloat(margin2500_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price2500_margin_customer, #table_price_customer_dropdown .tg_price2500_margin_customer').html(final_margin2500_customer.toFixed(1));

                                    var margin5000_customer = parseFloat(cart_per_total50_customer - cart_per_total5000_customer);
                                    var final_margin5000_customer = parseFloat(margin5000_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price5000_margin_customer, #table_price_customer_dropdown .tg_price5000_margin_customer').html( final_margin5000_customer.toFixed(1));

                                    var margin10000_customer = parseFloat(cart_per_total50_customer - cart_per_total10000_customer);
                                    var final_margin10000_customer = parseFloat(margin10000_customer / cart_per_total50_customer * 100);
                                    $('#table_price_customer .tg_price10000_margin_customer, #table_price_customer_dropdown .tg_price10000_margin_customer').html(final_margin10000_customer.toFixed(1));
                                    //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"

                                    //TABLE DIV
                                    $('#table_price').html();
                                    $('#table_price_dropdown').html();
                                    //PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                                    $('#table_price_customer').html();
                                    $('#table_price_customer_dropdown').html();
                                    //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"

                                    //$('#price_per_product_price,#price_print_setup').toggle(!(pr_quantity <= 200));

                                    // otherwise it hides the divs
                                } else {
                                    //HIDE DIV WITH INFORMATION FOR ADMINISTRATOR AND CUSTOMER
                                    $('#sectionInfoElement').hide();
                                    $('#pricesInfoElement').hide();
                                    $('#daysInfoElement').hide();
                                    //HIDE PRICES FOR ADMINISTRATOR AND CUSTOMER "ΤΙΜΗ ΑΝΑ ΠΡΟΪΟΝ"
                                    $('#price_per_product_price').hide();
                                    //HIDE PRICES FOR ADMINISTRATOR "ΤΙΜΗ ΠΕΛΑΤΗ ΑΝΑ ΠΡΟΪΟΝ"
                                    $('#price_per_product_price_front_customer').hide();
                                    $('#price_per_product_price_customer').hide();
                                    //HIDE PRICES FOR ADMINISTRATOR AND CUSTOMER "ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ"
                                    $('#price_cart_total').hide();
                                    //HIDE PRICES FOR ADMINISTRATOR "ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ ΠΕΛΑΤΗ"
                                    $('#price_cart_total_cus').hide();

                                    $('#shipping_days_shipping').hide();

                                    $('#shipping_days_express_shipping').hide();
                                    
                                    $('.iconWrap').hide();
                                    $('.iconWrap .tooltipCustom #info').hide();
                                    $('.iconWrap .tooltipCustom #max_printing_size').hide();
                                    $('.iconWrap .tooltipCustom #info_tech').show();
                                    $('.iconWrap .tooltipCustom #printing_technique_field').hide();
                                    $('.iconWrap .tooltipCustom #price_product_price').hide();

                                    $('#table_price').hide();
                                    //PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                                    $('#table_price_customer').hide();
                                    //END PRICES FOR ADMINISTRATOR "ΠΙΝΑΚΑΣ ΤΙΜΩΝ ΠΕΛΑΤΗ"
                                }
                                break;
                        }
                    }, 500);

                });

                function selectFirstOption( key ){
                    let first_available_option = '';
                    let sec_class = key.replace( 'attribute_', 'class_' );
                    $.each($( '.'+sec_class +' select[name="'+key+'"]:first option' ),function( i, index ){
                        console.log(i);
                        console.log(index);
                        if( $(index).val() != '' ){
                            first_available_option = $(index).val();
                            return false;
                        }
                    });
                    $('.variations_form').find('.'+sec_class +' select[name="'+key+'"]:first').val(first_available_option).trigger('change');
                }

                jQuery('.wd-swatch').on('mousedown', function() {
                    let arr = [];
                        jQuery('table.variations tr').each(function (el, value) {
                            if( jQuery( value ).find( ".swatches-select" ).length > 0 ){
                                arr.push(jQuery(value).find( ".swatches-select" ).data('id'));
                            } else {
                                //arr.push(jQuery(value).find( "select" ).attr('id'));
                            }
                        });
            
                        let lastElementArr = arr.pop();
            
                        var arraySize = [];
                        var thisVal = jQuery(this).data('value');
                        var thisDataId = jQuery(this).closest('.swatches-select').data('id');
                        product_variations.forEach(function(el, ind) {
                            if (el.attributes['attribute_' + thisDataId] === thisVal) {
                                arraySize.push(el.attributes);
                            }
                        });
                        var DataKeys = Object.keys(window.productVariable);
                        let someElement = DataKeys.indexOf('attribute_' + lastElementArr);

                    //get and set selected technique from last selected data
                    var last_selected_technique = window.productVariable['attribute_pa_technique'];
                
                    var DataVals = window.productVariable[DataKeys[someElement]];
            
                    var newDataKeys = [...DataKeys]; 
                    delete newDataKeys[someElement];
                    
                    var filtered = newDataKeys.filter(function (el) {
                        return el != null;
                    }).shift();
                    var shiftDataKey = DataKeys.indexOf(filtered);
                    
                    var arraySum = [];
                    var arraySumNo = [];
                    var ArrayDataShow = [];
                    var ArrayDAtaCheck = [];
                    var ArrayDataElement = [];
                    setTimeout(function() {
                        var attrName = DataKeys[someElement];
                        var SelectOpt = $('.variations_form').find('select')[0];
                        arraySize.forEach(function(el) {
                            ArrayDataShow.push(el[attrName]);
                        });

                        var attrNameId = DataKeys[someElement].replace('attribute_', '');

            
                        DataKeys.forEach((nameAttr,key) => {
                            var selectData = $('select[name="' + nameAttr + '"]').val();
                            if (!selectData) {
                                //get which technique is selected and set data based on that
                                let selected_technique = $( 'select[name="attribute_pa_technique"]' ).val();
                                product_variations.forEach(function(el, ind) {
                                    //if ( el.attributes[nameAttr] === DataVals && el.attributes['attribute_' +thisDataId] === thisVal ) { // old condition
                                    if ( el.attributes[nameAttr] === DataVals && ( el.attributes['attribute_' +thisDataId] === thisVal ) && ( el.attributes['attribute_pa_technique'] === selected_technique ) ) {
                                        ArrayDAtaCheck.push(el.attributes);
                                        arraySum.push({
                                            "ID": el.variation_id,
                                            "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                        });
                                    }
                                });
                            } else {
                                if(key < DataKeys.length-1){
                                    ArrayDataElement.push(selectData);
                                }
                            }
                        });


                        if (DataKeys.indexOf('attribute_' + thisDataId) > 0) {
                            var var_id = $('.variation_id').val();
                            product_variations.forEach(function(el, ind) {
                                
                                if (parseInt(var_id) === parseInt(el.variation_id)) {
                                    var KeysAttr = Object.keys(el.attributes);
                                    KeysAttr.forEach((key_el) => {
                                        if (!el.attributes[key_el]) {
                                            $('[name="' + key_el + '"]').closest('tr').hide();
                                        } else {
                                            $('[name="' + key_el + '"]').closest('tr').show();
                                        }
                                    });
                                }
                                if(el.attributes[DataKeys[shiftDataKey]]===ArrayDataElement[0] && el.attributes[DataKeys[someElement]]===ArrayDataElement[1]){
                                        arraySum.push({
                                            "ID": el.variation_id,
                                            "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                        });
                                }
                            });

                            //New code GG check if above all process variation not found check with change swatch
                            if( ArrayDAtaCheck.length <= 0 && arraySum.length <= 0 ){
                                product_variations.forEach(function( el, ind ){
                                    
                                    //if( el.attributes['attribute_'+thisDataId] == thisVal && el.attributes['attribute_pa_technique'] == last_selected_technique ){
                                    if( el.attributes['attribute_'+thisDataId] == thisVal && ArrayDataElement.length > 0 ){
                                        
                                        let var_found = true;
                                        /*let old_productVariable = Object.keys( window.productVariable );
                                        old_productVariable = old_productVariable.filter(function(item) {
                                            return item !== 'attribute_'+thisDataId
                                        });*/
                                        let old_productVariable = [];
                                        $.each(Object.keys( window.productVariable ), function( gi, gindex ){
                                            if( gindex === 'attribute_'+thisDataId ){
                                                return false;
                                            }
                                            old_productVariable.push( gindex );
                                        });
                                        $.each( old_productVariable, function( attr_index, attr_key ){
                                            if ( $.inArray( el.attributes[attr_key], ArrayDataElement ) === -1 ) {
                                            //if( el.attributes[attr_key] !== window.productVariable[attr_key] ){
                                                var_found = false;
                                            }
                                        });
                                        if( var_found ){
                                            ArrayDAtaCheck.push(el.attributes);
                                            arraySum.push({
                                                "ID": el.variation_id,
                                                "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                            });
                                        }
                                    } else if ( el.attributes['attribute_'+thisDataId] == thisVal && el.attributes['attribute_pa_technique'] == last_selected_technique ) {
                                        ArrayDAtaCheck.push(el.attributes);
                                        arraySum.push({
                                            "ID": el.variation_id,
                                            "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                        });
                                    }
                                });
                            }

                            if (ArrayDAtaCheck.length > 0) {
                                var id_Variable = arraySum.hasMin("Cost");
                                product_variations.forEach(function(el, ind) {
                                    if (el.variation_id === id_Variable.ID) {
                                        //Object.values(el.attributes).forEach(function(data) {
                                        $.each(el.attributes, function(key, data) {
                                            let sec_class = key.replace( 'attribute_', 'class_' );
                                            $( '.variations_form .'+sec_class ).find('div[data-value="' +data +'"]').trigger('click');
                                            if( $('.variations_form').find('div[data-value="' +data +'"]').length <= 0 ){
                                                if( data != '' ){
                                                    $( '.'+sec_class +' select[name="'+key+'"]' ).val( data ).trigger('change');
                                                } else {
                                                    selectFirstOption(key);
                                                    //$( '.'+sec_class +' select[name="'+key+'"]' ).val( data ).trigger('change');
                                                }
                                            }
                                        });
                                    }
                                });
                                var Val1 = Object.values(ArrayDAtaCheck[0]);
                                var Keys1 = Object.keys(ArrayDAtaCheck[0]);
                                Val1.forEach((val) => {

                                    
                                });
                            }
                            var idVariable = arraySum.hasMin("Cost");
                            if(idVariable && arraySum.length>0){
                                product_variations.forEach(function(el, ind) {
                                    if (el.variation_id === idVariable.ID) {
                                        Object.values(el.attributes).forEach(function( data, key) {
                                        //$.each(el.attributes)(function( key, data ) {
                                            let attributeKeyg = Object.keys(el.attributes)[key];
                                            let sec_class = attributeKeyg.replace( 'attribute_', 'class_' );
                                            if( $( '.variations_form .'+sec_class ).find('div[data-value="' +data +'"]').length > 0 ){
                                                $( '.variations_form .'+sec_class ).find('div[data-value="' +data +'"]').trigger('click');
                                            } else {
                                                if( data != '' ){
                                                    $( '.'+sec_class +' select[name="'+attributeKeyg+'"]' ).val( data ).trigger('change');
                                                } else {
                                                    selectFirstOption(attributeKeyg);
                                                }
                                                //$('.variations_form').find('select option[value="' +data +'"]').prop( 'selected', true );
                                            }
                                        });
                                    }
                                });
                            }
                        } 


                        if (DataKeys.indexOf('attribute_' + thisDataId) === shiftDataKey) {
                            $('div[data-id="' + attrNameId + '"]').find('div.wd-swatch').each(function(i,elm) {
                                if (ArrayDataShow.indexOf($(elm).data('value')) != -1) {
                                    $('div[data-value="' + $(elm).data('value') + '"]').css('display', 'inline-block');
                                } else {
                                    $('div[data-value="' + $(elm).data('value') + '"]').css('display', 'none');
                                }
                            });
                
                            
                            if ($(SelectOpt).attr('id') === thisDataId) {
                                product_variations.forEach(function(el, ind) {
                                    if (el.attributes['attribute_' + thisDataId] === thisVal && Object.keys(el.attributes).length === Object.values(el.attributes).filter(Boolean).length) {
                                        arraySum.push({
                                            "ID": el.variation_id,
                                            "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                        });
                                        $.each(Object.keys(el.attributes), function( data, key ){
                                            if (Object.keys(el.attributes).indexOf(key) !== -1 && el.attributes[key].length > 0) {
                                                $('select[name="'+key+'"]').closest('tr').css('opacity', 1).closest('tr').css('height', 'auto').closest('tr').css('display', 'table-row');
                                            }
                                        });
                                    } else if (el.attributes['attribute_' + thisDataId] === thisVal && Object.keys(el.attributes).length === Object.values(el.attributes).length) {
                                        $.each(Object.keys(el.attributes), function( data, key ){
                                            if ( Object.keys(el.attributes).indexOf(key) !== -1 && el.attributes[key].length === 0 ) {
                                                $('select[name="'+key+'"]').closest('tr').css('opacity', 0).closest('tr').css('height', 0).closest('tr').css('display', 'table-column');
                                            } else {
                                                $('select[name="'+key+'"]').closest('tr').css('opacity', 1).closest('tr').css('height', 'auto').closest('tr').css('display', 'table-row');
                                            }
                                        });
                                        arraySumNo.push({
                                            "ID": el.variation_id,
                                            "Cost": parseFloat(window.arrayProductVariable[el.variation_id])
                                        });
                                    }
                                });
                                
                                let minPrpriceID = arraySum.hasMin("Cost");
                                let minPrpriceIDNo = arraySumNo.hasMin("Cost");

                                if (minPrpriceID) {
                                    let arrayVerProduct = [];
                                    product_variations.forEach(function(el, ind) {
                                        if (el.variation_id === minPrpriceID.ID) {
                                            arrayVerProduct.push(el.attributes);
                                        } else if (arraySum.length === 0 && el.variation_id ===minPrpriceIDNo.ID) {
                                            arrayVerProduct.push(el.attributes);
                                        }
                                    });
                                    window.productVariable = arrayVerProduct[0];
                                    Object.values(arrayVerProduct[0]).reverse().forEach(function(data, key) {
                                        
                                        $('.variations_form').find('div[data-value="' + data + '"]').trigger('click');
                                        if( $('.variations_form').find('div[data-value="' + data + '"]').length <= 0 ){
                                            if( data != '' ){
                                                
                                                $('.variations_form').find('select option[value="' + data + '"]').prop( 'selected', true );
                                                var reverse_verproduct = Object.keys( arrayVerProduct[0] ).reverse();
                                                var select_key = reverse_verproduct[key];
                                                
                                                $( 'select name="'+select_key+'"' ).trigger('change');
                                            } else {
                                                var reverse_verproduct = Object.keys(arrayVerProduct[0]).reverse();
                                                selectFirstOption( reverse_verproduct[key] );
                                            }
                                        }
                                    });
                                    
                                    if (arrayVerProduct.indexOf('no-print') !== -1) {
                                        for ($x = 1; $x < $('.variations').find('tr').length; $x++) {
                                            $($('.variations').find('tr')[$x]).hide();
                                        }
                                    } else {
                                        for ($x = 1; $x < $('.variations').find('tr').length; $x++) {
                                            $($('.variations').find('tr')[$x]).show();
                                        }
                                    }
                                } else if (minPrpriceIDNo) {
                                    let arrayVerProduct = [];
                                    product_variations.forEach(function(el, ind) {
                                        if (el.variation_id === minPrpriceIDNo.ID) {
                                            arrayVerProduct.push(el.attributes);
                                        }
                                    });
                                    var ArrayData = [];
                                    window.productVariable = arrayVerProduct[0];
                                    
                                    Object.values(arrayVerProduct[0]).forEach(function(data, key) {
                                        var valSelect;
                                        
                                        if (!data && key > 1) {
                                            var keyHide = Object.keys(arrayVerProduct[0])[key];
                                            var idSelect = keyHide.replace('attribute_','');
                                            valSelect = $($('#' + idSelect).find('option')[1]).val();
                                        }
                                        if (data.length > 0) {
                                            ArrayData.push(data);
                                            $('.variations_form').find('div[data-value="' + data + '"]').trigger('click');
                                        }
                                        if (valSelect) {
                                            ArrayData.push(valSelect);
                                            $('.variations_form').find('div[data-value="' + valSelect + '"]').trigger('click');
                                        }
                                    });
                                    
                                    if (ArrayData.indexOf('no-print') !== -1) {
                                        for ($x = 1; $x < $('.variations').find('tr')
                                            .length; $x++) {
                                            $($('.variations').find('tr')[$x]).hide();
                                        }
                                    } else {
                                        for ($x = 1; $x < $('.variations').find('tr')
                                            .length; $x++) {

                                            $($('.variations').find('tr')[$x]).show();
                                        }
                                    }
                                    ArrayData.reverse().forEach(function(val) {
                                        $('.variations_form').find('div[data-value="' + val + '"]').trigger('click');
                                        if( $('.variations_form').find('div[data-value="' + val + '"]').length <= 0 ){
                                            var select_obj = $('.variations_form').find('select option[value="' + val + '"]');
                                            select_obj.prop('selected', true );
                                            select_obj.parent();
                                            
                                        }
                                    });
                                    $('.variations_form').find('[name=quantity]').trigger('change');
                                }
                            }
                        }
                        if(Object.values(ArrayDataShow).filter(Boolean).length === 0) {
                            $('#'+attrNameId).closest('tr').addClass('display-none');
                        } else {
                            $('#'+attrNameId).closest('tr').removeClass('display-none');
                        }
                    }, 500);
                });

                jQuery('.wd-swatch').on('click', function(e) {
                    if(e.originalEvent){
                    $('.select-flex-block').hide();
                    }
                });

                var quantityPR = 100;
                var arrayProductVariable = [];
                window.manipulation_price = '<?php echo (!empty(get_field('manipulation')))? get_field('manipulation'): 0; ?>';
                var encodedPrice = "<?php echo $encoded_price; ?>";
                var price_main = atob(encodedPrice);
                //var price_main = <?php //echo json_encode(get_field('_price_main', $product_id)); ?>;
                Object.keys(window.productData.variation).forEach(element => {
                    if (element) {
                        var variable = window.productData.variation[element];
                        
                        var result = Object.keys(variable).filter(function(el) {
                            return el.indexOf('price_' + quantityPR + '_') === 0;
                        });
                        
                        
                        var result_print = Object.keys(variable).filter(function(el1) {
                            return el1.indexOf('price_print_' + quantityPR + '_') === 0;
                        });
                        
                        var product_price = parseFloat(price_main * quantityPR);
                        var price_print_price = parseFloat(variable[result_print[1]] * quantityPR);
                        var manipulation_product_total = parseFloat(parseFloat(window.manipulation_price) * quantityPR);
                        
                        var cart_total = parseFloat(product_price + price_print_price + parseFloat(variable.price_print_setup) + manipulation_product_total || 0);
                        
                        if (parseInt((cart_total / quantityPR).toFixed(2)) >= 0) {
                            arrayProductVariable[element] = (cart_total / quantityPR).toFixed(2);
                        }
                    }
                });
                window.arrayProductVariable = arrayProductVariable;

            });
        //SHIPPING BUTTONS
        });
    </script>


<script>
function openNav() {

    //document.getElementById("mySidenav").style.transform = "translateX(-100%)";  // Pull into view
	var mySidenav = document.getElementById("mySidenav");
	mySidenav.style.transform = "translateX(-100%)";
	//mySidenav.style.overflowX = "visible";
    document.getElementById("overlaySidenav").style.display = "block"; // Show overlay
    document.addEventListener('click', closeNavOnClickOutside);
}

function closeNav() {
    //document.getElementById("mySidenav").style.transform = "translateX(0)";  // Hide by pushing it out of view
	var mySidenav = document.getElementById("mySidenav");
	mySidenav.style.transform = "translateX(0)";
	//mySidenav.style.overflowX = "hidden";
    document.getElementById("overlaySidenav").style.display = "none"; // Hide overlay
    document.removeEventListener('click', closeNavOnClickOutside);
}

function closeNavOnClickOutside(event) {
    var sidenav = document.getElementById("mySidenav");
    var overlay = document.getElementById("overlaySidenav");

    // Check if click target is outside the side navigation, the overlay, and also not the open button
    if (event.target === overlay || (!sidenav.contains(event.target) && event.target.id !== 'openNavBtn')) {
        closeNav();
    }
}

</script>

<?php

}
<?php

use Drupal\Core\Form\FormStateInterface;

function base_installation_form_install_configure_form_alter(&$form, FormStateInterface $form_state) {
    // Add a placeholder as example that ne can choose sitename
    $form['site_information']['site_name']['#attributes']['placeholder'] = t('Site Name');

    // Default sitemail
    $form['site_information']['site_mail']['#default_value'] = 'jason.bozoki@gmail.com';
    $form['site_information']['site_mail']['#attributes']['style'] = 'width: 25em;';

    // Set user 1
    $form['admin_account']['account']['name']['#default_value'] = 'admin';
    $form['admin_account']['account']['mail']['#default_value'] = 'jason.bozoki@gmail.com';
    $form['admin_account']['account']['mail']['#description'] = t('This email will be used for the administrator account. It is recommended to use a valid email address for the administrator account. This email will be used for password reset and other notifications.');

    // Set region
    $form['regional_settings']['site_default_country']['#default_value'] = 'NL';
    $form['regional_settings']['date_default_timezone']['#default_value'] = 'Europe/Amsterdam';
}
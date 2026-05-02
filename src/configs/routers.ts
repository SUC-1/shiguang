import LOGIN from '../pages/login.jsx';
import FAMILY_ROLE from '../pages/family-role.jsx';
import FAMILY_MEMBER from '../pages/family-member.jsx';
import FAMILY_CHEF from '../pages/family-chef.jsx';
import FAMAILY_HOME from '../pages/famaily-home.jsx';
import DINING_HOME from '../pages/dining-home.jsx';
import DINING_MENU from '../pages/dining-menu.jsx';
import DINING_QRCODE from '../pages/dining-qrcode.jsx';
import AI_COPYWRITING from '../pages/ai-copywriting.jsx';
export const routers = [{
  id: "login",
  component: LOGIN
}, {
  id: "family-role",
  component: FAMILY_ROLE
}, {
  id: "family-member",
  component: FAMILY_MEMBER
}, {
  id: "family-chef",
  component: FAMILY_CHEF
}, {
  id: "famaily-home",
  component: FAMAILY_HOME
}, {
  id: "dining-home",
  component: DINING_HOME
}, {
  id: "dining-menu",
  component: DINING_MENU
}, {
  id: "dining-qrcode",
  component: DINING_QRCODE
}, {
  id: "ai-copywriting",
  component: AI_COPYWRITING
}]
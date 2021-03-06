import React, { useState, useEffect } from "react";
import { message, Card, Spin } from "antd";
import { connect } from "react-redux";

import { getSubCategoriesApi, cancelReq } from "../../api";
// import { AncestorCategoriesContext } from "../../components/Reducer";
import { pushCategory } from "../../redux/actions";
import { IMAGES_DIR } from "../../config";

const { Meta } = Card;

function Category(props) {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { ancestorCategories, pushCategory } = props;
  // const {
  //   ancestorCategories,
  //   ancestorCategoriesDispatch,
  // } = useContext(AncestorCategoriesContext);

  useEffect(() => {
    //一个有3个层级的分类，加上开头那个“一级分类列表”就是4个。当分类连长度达到4后，就该跳到商品列表页显示商品列表了。
    if (ancestorCategories.length >= 4) {
      props.history.push("/admin/goodsManage/goodsList");
    } else {
      //获取祖先链最后一个节点的所有子分类列表并把它们显示在页面上
      setLoading(true);
      getSubCategoriesApi(
        ancestorCategories[ancestorCategories.length - 1]._id
      ).then(({ code, data, msg }) => {
        setLoading(false);
        if (code === 0) {
          setSubCategories(data.subCategories);
        } else {
          message.error(msg);
        }
      });
    }
    return cancelReq;
  }, [ancestorCategories, props.history]);

  return (
    <Spin spinning={loading} tip="Loading...">
      <div>
        {subCategories.map((category) => (
          <Card
            key={category._id}
            hoverable
            style={{ float: "left", padding: 10, margin: 10 }}
            bodyStyle={{ padding: 0 }}
            //如果subCategories是三级分类列表，则还要显示每一个分类的图片
            cover={
              category.categoryImage ? (
                <img
                  alt="商品分类图片"
                  style={{ height: 105, width: 105 }}
                  src={IMAGES_DIR + category.categoryImage}
                />
              ) : null
            }
            onClick={() => {
              pushCategory(category);
            }}
          >
            <Meta
              title={
                <span style={{ color: "#999999" }}>
                  {category.categoryName}
                </span>
              }
              style={{ textAlign: "center", width: 105 }}
            />
          </Card>
        ))}
      </div>
    </Spin>
  );
}

// export default Category;
export default connect(
  (state) => ({
    ancestorCategories: state.ancestorCategories,
  }),
  { pushCategory }
)(Category);

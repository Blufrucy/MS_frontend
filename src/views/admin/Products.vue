<template>
  <div class="admin-products">
    <el-card>
      <div class="header">
        <h2>商品管理</h2>
        <el-button type="primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>

      <el-table :data="products" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="description" label="商品描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="originalPrice" label="原价" width="120">
          <template #default="{ row }">
            ¥{{ row.originalPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加商品对话框 -->
    <el-dialog
      v-model="showDialog"
      title="添加商品"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="商品原价" prop="originalPrice">
          <el-input-number
            v-model="form.originalPrice"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="商品图片" prop="file">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept="image/*"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 jpg、png 格式，大小不超过 2MB</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getProductList, addProduct } from '@/api/admin'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const products = ref([])
const formRef = ref()
const uploadFile = ref(null)

const form = reactive({
  name: '',
  description: '',
  originalPrice: null,
  file: null
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
  originalPrice: [{ required: true, message: '请输入商品原价', trigger: 'blur' }]
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList()
    products.value = res.data || []
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file) => {
  uploadFile.value = file.raw
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (!uploadFile.value) {
      ElMessage.warning('请上传商品图片')
      return
    }

    submitting.value = true
    try {
      const formData = new FormData()
      formData.append('file', uploadFile.value)
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('originalPrice', form.originalPrice)
      formData.append('status', 1)

      await addProduct(formData)
      ElMessage.success('添加成功')
      showDialog.value = false
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('添加商品失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

const toggleStatus = async (product) => {
  // TODO: 实现商品上下架功能
  ElMessage.info('商品上下架功能待实现')
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    description: '',
    originalPrice: null,
    file: null
  })
  uploadFile.value = null
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для работы с отзывами: создание, получение списка, модерация'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            review_type = params.get('type')
            book_id = params.get('book_id')
            status = params.get('status', 'approved')
            
            query = 'SELECT * FROM reviews WHERE status = %s'
            query_params = [status]
            
            if review_type:
                query += ' AND type = %s'
                query_params.append(review_type)
            
            if book_id:
                query += ' AND book_id = %s'
                query_params.append(book_id)
            
            query += ' ORDER BY created_at DESC'
            
            cursor.execute(query, tuple(query_params))
            reviews = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(r) for r in reviews], ensure_ascii=False, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            review_type = body.get('type')
            book_id = body.get('book_id')
            author_name = body.get('author_name', '').strip()
            rating = body.get('rating')
            content = body.get('content', '').strip()
            
            if not review_type or not author_name or not content:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Необходимо заполнить имя и текст отзыва'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if review_type not in ['book', 'app']:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Неверный тип отзыва'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                '''INSERT INTO reviews (type, book_id, author_name, rating, content, status) 
                   VALUES (%s, %s, %s, %s, %s, 'pending') RETURNING id''',
                (review_type, book_id, author_name, rating, content)
            )
            
            review_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': review_id, 'message': 'Отзыв отправлен на модерацию'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            review_id = body.get('id')
            new_status = body.get('status')
            
            if not review_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Необходимо указать ID отзыва и новый статус'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                'UPDATE reviews SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                (new_status, review_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Статус отзыва обновлён'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
